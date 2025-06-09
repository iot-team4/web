import { SensorType } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { SensorQueryRange } from '../enums/sensor-query-range.enum';

export class GetSensorSummaryQueryDto {
  @IsEnum(SensorType)
  sensorType: SensorType;

  @IsOptional()
  @IsEnum(SensorQueryRange)
  range: SensorQueryRange = SensorQueryRange.TWENTY_FOUR_H;
}
