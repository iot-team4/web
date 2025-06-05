import { IsEnum, IsOptional } from 'class-validator';
import { SensorType } from '@prisma/client';
import { SensorQueryRange } from '../enums/sensor-query-range.enum.ts';

export class GetSensorSummaryQueryDto {
  @IsEnum(SensorType)
  sensorType: SensorType;

  @IsOptional()
  @IsEnum(SensorQueryRange)
  range: SensorQueryRange = SensorQueryRange.TWENTY_FOUR_H;
}
