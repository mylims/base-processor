import dotenv from 'dotenv';
import { mocked } from 'jest-mock';

import Processor from '../Processor';
import ProcessorManager from '../ProcessorManager';
import {
  getFile,
  getNextUrl,
  updateEventStatus,
  uploadMeasurement,
} from '../api';
import { EventDataType, EventStatus } from '../types';

jest.mock('dotenv');
jest.mock('../api');
const mockedDotenv = mocked(dotenv, true);
const mockedGetFile = mocked(getFile, true);
const mockedGetNextUrl = mocked(getNextUrl, true);
const mockedUpdateEventStatus = mocked(updateEventStatus, true);
const mockedUploadMeasurement = mocked(uploadMeasurement, true);

async function processorFunc(processor: Processor) {
  if (!processor.file) throw new Error('Missing file');

  const { filename } = processor.file;
  const username = filename.split('_')[0];
  const sampleCode = filename.split('_').slice(1);
  const content = (await processor.file.read()).toString();

  processor.addMeasurement({
    file: {
      content,
      filename: `${filename}.jdx`,
      mimetype: 'chemical/x-jcamp-dx',
    },
    measurementType: 'iv',
    derivedData: { test: 'test' },
    sampleCode,
    username,
  });
}

test('Basic flow', () => {
  mockedDotenv.config.mockImplementation(() => ({
    parsed: {
      SERVICE_TOKEN: 'token',
      EVENTS_ENDPOINT: 'test',
      PROCESSOR_ID: 'test',
      FILE_DOWNLOAD_ENDPOINT: 'test',
      FILE_UPLOAD_ENDPOINT: 'test',
    },
  }));
  const processor = new ProcessorManager({
    verbose: true,
    username: 'test',
    topic: 'test',
    autoCreateSample: true,
    processorFunction: processorFunc,
  });

  // Mocks
  mockedGetFile.mockImplementation(() =>
    Promise.resolve({
      filename: 'patiny_LP1234_F1.jdx',
      body: Buffer.from('test'),
    }),
  );
  mockedGetNextUrl.mockImplementation(() =>
    Promise.resolve({
      _id: 'test',
      topic: 'test',
      data: { type: EventDataType.FILE, fileId: 'test' },
      createdAt: new Date(),
      processors: [
        {
          processorId: 'test',
          history: [
            {
              processId: 'test',
              status: EventStatus.PROCESSING,
              date: new Date(),
            },
          ],
        },
      ],
    }),
  );
  mockedUpdateEventStatus.mockImplementation(() => Promise.resolve());
  mockedUploadMeasurement.mockImplementation(() => Promise.resolve());

  expect(() => processor.run()).not.toThrow();
});
