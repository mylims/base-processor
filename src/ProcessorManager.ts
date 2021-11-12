import { promisify } from 'util';

import dotenv from 'dotenv';
import pino from 'pino';

import Processor from './Processor';
import {
  getFile,
  getNextUrl,
  updateEventStatus,
  uploadMeasurement,
} from './api';
import { ProcessorParams, EventStatus, ProcessorEnvs } from './types';

const asyncTimeout = promisify(setTimeout);

export default class ProcessorManager {
  public logger = pino({ prettyPrint: { colorize: true } });
  public username?: string;
  public topic: string;

  private envs: ProcessorEnvs;
  private interval?: number;
  private autoCreateSample: boolean;
  private processorFunction: (processor: Processor) => Promise<void>;

  public constructor({
    interval,
    verbose,
    username,
    topic,
    autoCreateSample,
    processorFunction,
  }: ProcessorParams) {
    this.interval = interval;
    this.username = username;
    this.topic = topic;
    this.autoCreateSample = autoCreateSample;
    this.processorFunction = processorFunction;
    this.logger.level = verbose ? 'debug' : 'info';

    // Save env variables
    const env = dotenv.config();
    if (env.parsed) {
      this.envs = {
        token: env.parsed.SERVICE_TOKEN,
        eventUrl: env.parsed.EVENTS_ENDPOINT,
        processorId: env.parsed.PROCESSOR_ID,
        fileEndpoint: env.parsed.FILE_DOWNLOAD_ENDPOINT,
        uploadEndpoint: env.parsed.FILE_UPLOAD_ENDPOINT,
      };
    } else {
      throw new Error('Missing environment variables');
    }
  }

  public async run() {
    if (this.interval !== undefined) {
      while (true) {
        await this.executeProcessor();
        await this.wait();
      }
    } else {
      await this.executeProcessor();
    }
  }

  private async wait() {
    if (this.interval !== undefined) {
      this.logger.info(`Waiting ${this.interval} seconds...`);
      await asyncTimeout(this.interval * 1000);
    }
  }

  private async executeProcessor() {
    const event = await this._fetchEvent();
    if (event) {
      const eventId = event.event._id;
      const processId = event.processId;
      const { status, message } = await this._processEvent(
        eventId,
        event.event.data.fileId,
      );
      return updateEventStatus(this.envs, {
        eventId,
        processId,
        status,
        message,
      });
    }
  }

  private async _fetchEvent() {
    this.logger.info('Checking for new events...');

    try {
      const event = await getNextUrl(this.envs, this.topic);
      const processId = event.processors.find(
        (processor) => this.envs.processorId === processor.processorId,
      )?.history[0]?.processId;
      if (!processId) {
        throw new Error(`Process ${this.envs.processorId} not found`);
      }
      return { event, processId };
    } catch (error) {
      this.logger.error(error, 'Failed new event fetch');
    }
  }

  private async _processEvent(
    eventId: string,
    fileId: string,
  ): Promise<{ status: EventStatus; message?: string }> {
    try {
      // Fetch the original file
      this.logger.debug(`Fetching file ${fileId}...`);
      const { filename, body } = await getFile(this.envs, fileId);

      this.logger.info('Processing event ...', eventId);
      const processor = new Processor({ filename }, body);
      await this.processorFunction(processor);

      // Send the results to the server
      for (const measurement of processor.measurements) {
        await uploadMeasurement(this.envs, {
          measurement,
          eventId,
          autoCreateSample: this.autoCreateSample,
        });
        this.logger.info('Result uploaded', eventId, filename);
      }

      this.logger.info('Finished event processing', eventId);
      return { status: EventStatus.SUCCESS };
    } catch (error) {
      this.logger.error(error, eventId);
      return { status: EventStatus.ERROR, message: error.message };
    }
  }
}
