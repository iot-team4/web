import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export enum OrderBy {
  ASC = 'asc',
  DESC = 'desc',
}

export class GetControlLogRequestQueryDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  limit?: number = 20;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  offset?: number = 0;

  @IsOptional()
  @IsEnum(OrderBy)
  orderBy?: OrderBy = OrderBy.DESC;
}
