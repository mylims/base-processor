import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import Processor from './Processor';
import ProcessorManager from './ProcessorManager';
import { ProcessorParams } from './types';

export { Processor };
export type { ProcessorParams, MeasurementType } from './types';

export interface ProcessorConfig {
  topic: string;
  processor: ProcessorParams['processorFunction'];
  autoCreateSample?: boolean;
}

export function processorCli({
  topic,
  autoCreateSample = false,
  processor: processorFunc,
}: ProcessorConfig) {
  const { verbose, interval, username } = yargs(hideBin(process.argv))
    // Define the command line options
    .options({
      verbose: {
        alias: 'v',
        type: 'boolean',
        description: 'Run with verbose logging',
        default: false,
      },
      interval: {
        alias: 'i',
        type: 'number',
        description: 'Interval in seconds',
        demandOption: false,
      },
      username: {
        alias: 'u',
        type: 'string',
        description: 'Unique identification for user',
        demandOption: false,
      },
    })
    .usage('Usage: $0 <command> [options]')
    .command('process', 'start the processor')
    .example(
      '$0 process --interval 10',
      'count the lines in the given file',
    ).argv;

  const processor = new ProcessorManager({
    verbose,
    interval,
    username,
    topic,
    autoCreateSample,
    processorFunction: processorFunc,
  });
  processor.run().catch((err) => processor.logger.error(err));
}
