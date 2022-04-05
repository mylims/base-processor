import Processor from './Processor';

// Event related types
export enum EventStatus {
  ERROR = 'error',
  SUCCESS = 'success',
  PENDING = 'pending',
  PROCESSING = 'processing',
}
export enum EventDataType {
  FILE = 'file',
}

export interface EventProcessor {
  processorId: string;
  history: EventHistory[];
}

export interface EventHistory {
  date: Date;
  processId: string;
  status: EventStatus;
  message?: string;
}

export interface EventData {
  fileId: string;
  type: EventDataType;
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
  processorFunction(processor: Processor): Promise<void>;
  interval?: number;
  username?: string;
}
export interface ProcessorEnvs {
  token: string;
  eventUrl: string;
  processorId: string;
  fileEndpoint: string;
  uploadEndpoint: string;
}

export interface MeasurementFileType {
  content: string | Buffer;
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
  measurementType: string;
  derivedData: Record<string, string>;
  title?: string;
  file?: MeasurementFileType | MeasurementPathType;
}
export interface MeasurementUUID10 extends Measurement {
  uuid10: string;
}
export interface MeasurementSampleCode extends Measurement {
  username: string;
  sampleCode: string[];
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
