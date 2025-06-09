import { SensorType } from '@prisma/client';
import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';

export class GetSensorSummaryRequestQueryDto {
  @IsEnum(SensorType)
  sensorType: SensorType;

  @IsString()
  @IsIn(['24h', '7d'])
  @IsOptional()
  range?: string = '24h';
}
