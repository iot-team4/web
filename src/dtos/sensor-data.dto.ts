import { SensorType } from '@prisma/client';
import { IsDate, IsEnum, IsNumberString } from 'class-validator';

export class SensorDataDto {
  @IsEnum(SensorType)
  sensorType: SensorType;

  @IsNumberString()
  value: number;

  @IsDate()
  createdAt: Date;

  constructor(sensorType: SensorType, value: number) {
    this.sensorType = sensorType;
    this.value = value;
    this.createdAt = new Date();
  }
}
