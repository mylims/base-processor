import FormData from 'form-data';
import got from 'got';

import {
  Event,
  isUUID10,
  EventStatus,
  ProcessorEnvs,
  MeasurementType,
  isMeasurementFileType,
} from './types';

export function getNextUrl(envs: ProcessorEnvs, topic: string): Promise<Event> {
  const nextEventUrl = `${envs.eventUrl}/next-event`;
  return got
    .post(nextEventUrl, {
      json: { topic, processorId: envs.processorId },
      headers: { Authorization: envs.token },
    })
    .json<Event>();
}

export async function getFile(envs: ProcessorEnvs, fileId: string) {
  const { headers, body } = await got.get(envs.fileEndpoint, {
    responseType: 'buffer',
    searchParams: { id: fileId },
    headers: { Authorization: envs.token },
  });

  // Extract filename from headers
  const filename =
    headers['content-disposition']?.split(';')[1]?.match(/"(?<id>.*?)\.csv"/)
      ?.groups?.id ?? fileId;
  return { filename, body };
}

interface UploadMeasurementParams {
  measurement: MeasurementType;
  autoCreateSample: boolean;
  eventId: string;
}
export async function uploadMeasurement(
  envs: ProcessorEnvs,
  { measurement, autoCreateSample, eventId }: UploadMeasurementParams,
) {
  const formData = new FormData();
  if (measurement.file) {
    if (isMeasurementFileType(measurement.file)) {
      formData.append(
        'file',
        measurement.file.content,
        measurement.file.filename,
      );
    } else {
      throw new Error('Method not defined');
    }
  }
  if (measurement.derivedData) {
    formData.append('derived', JSON.stringify(measurement.derivedData));
  }
  if (isUUID10(measurement)) {
    throw new Error('Method undefined');
  } else {
    formData.append('sampleCode', measurement.sampleCode.join(','));
    formData.append('username', measurement.username);
  }
  if (autoCreateSample) {
    formData.append('autoCreateSample', 'true');
  }
  formData.append('collection', measurement.measurementType);
  formData.append('eventId', eventId);

  await got.post(envs.uploadEndpoint, {
    body: formData,
    headers: { Authorization: envs.token },
  });
}

interface UpdateEventStatusParams {
  eventId: string;
  processId: string;
  status: EventStatus;
  message?: string;
}
export async function updateEventStatus(
  envs: ProcessorEnvs,
  params: UpdateEventStatusParams,
): Promise<void> {
  await got.put(`${envs.eventUrl}/set-event`, {
    json: { ...params, processorId: envs.processorId },
    headers: { Authorization: envs.token },
  });
}
