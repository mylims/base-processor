# base-processor

[![build status][ci-image]][ci-url]

Library for creating processors with MYLIMS

## Usage

First time please be sure to have everything properly configured:

```bash
cp .env.example .env
npm install
npm run tsc
```

After is possible to define a processor that will consume the data from the file
and will be able to upload a measurement to the database.

```ts
import { Processor, ProcessorConfig } from '@mylims/base-processor';
import { fromB1505, toJcamp } from 'iv-spectrum';

const config: ProcessorConfig = {
  topic: 'b1505',
  process: processorFunc,
  autoCreateSample: false,
};

async function processorFunc(processor: Processor) {
  if (!processor.file) throw new Error('Missing file');

  const { filename } = processor.file;
  const username = filename.split('_')[0];
  const sampleCode = filename.split('_').slice(1);
  const content = await processor.file.read();
  const analyses = fromB1505(content);

  for (const analysis of analyses) {
    const jcamp = toJcamp(analysis);
    processor.addMeasurement({
      file: {
        content: jcamp,
        filename: `${filename}.jdx`,
        mimetype: 'chemical/x-jcamp-dx',
      },
      measurementType: 'iv',
      derivedData: analysis.derived,
      sampleCode,
      username,
    });
  }
}

export default config;
```

## License

[MIT](./LICENSE)

[ci-image]: https://github.com/mylims/base-processor/workflows/Node.js%20CI/badge.svg?branch=main
[ci-url]: https://github.com/mylims/base-processor/actions?query=workflow%3A%22Node.js+CI%22
