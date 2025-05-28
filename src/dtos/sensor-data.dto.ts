import { SensorType } from '@prisma/client';
import { IsEnum, IsNumberString } from 'class-validator';

export class SensorDataDto {
  @IsEnum(SensorType)
  sensorType: SensorType;

  @IsNumberString()
  value: number;

  constructor(sensorType: SensorType, value: number) {
    this.sensorType = sensorType;
    this.value = value;
  }
}
