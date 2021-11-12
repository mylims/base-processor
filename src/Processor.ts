import { FileType, MeasurementType } from './types';

export default class Processor {
  public file: FileType;
  public measurements: MeasurementType[] = [];

  public constructor(file: Omit<FileType, 'read'>, content: Buffer) {
    this.file = { ...file, read: async () => content };
  }

  public addMeasurement(measurement: MeasurementType) {
    this.measurements.push(measurement);
  }
}
