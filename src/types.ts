import Processor from './Processor';

// Event related types
export enum EventStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  ERROR = 'error',
}
export enum EventDataType {
  FILE = 'file',
}

export interface EventProcessor {
  processorId: string;
  history: EventHistory[];
}

export interface EventHistory {
  processId: string;
  status: EventStatus;
  date: Date;
  message?: string;
}

export interface EventData {
  type: EventDataType;
  fileId: string;
}

export interface Event {
  _id: string;
  topic: string;
  data: EventData;
  createdAt: Date;
  processors: EventProcessor[];
}

// Processor related types
export interface ProcessorParams {
  topic: string;
  verbose: boolean;
  autoCreateSample: boolean;
  interval?: number;
  username?: string;
  processorFunction(processor: Processor): Promise<void>;
}
export interface ProcessorEnvs {
  token: string;
  eventUrl: string;
  processorId: string;
  fileEndpoint: string;
  uploadEndpoint: string;
}

export interface MeasurementFileType {
  content: string;
  filename: string;
  mimetype?: string;
}
export interface MeasurementPathType {
  absolutePath: string;
  mimetype?: string;
}
export function isMeasurementFileType(
  file: MeasurementFileType | MeasurementPathType,
): file is MeasurementFileType {
  return (file as MeasurementFileType).filename !== undefined;
}
interface Measurement {
  file?: MeasurementFileType | MeasurementPathType;
  measurementType: string;
  derivedData: Record<string, string>;
}
export interface MeasurementUUID10 extends Measurement {
  uuid10: string;
}
export interface MeasurementSampleCode extends Measurement {
  sampleCode: string[];
  username: string;
}
export function isUUID10(
  measurement: MeasurementType,
): measurement is MeasurementUUID10 {
  return (measurement as MeasurementUUID10).uuid10 !== undefined;
}
export type MeasurementType = MeasurementUUID10 | MeasurementSampleCode;

export interface FileType {
  filename: string;
  dirname?: string;
  extension?: string;
  read(): Promise<Buffer>;
}
