import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export enum OrderBy {
  ASC = 'asc',
  DESC = 'desc',
}

export class GetControlLogRequestQueryDto {
  @IsOptional()
  @IsNumber()
  limit?: number = 20;

  @IsOptional()
  @IsEnum(OrderBy)
  orderBy?: OrderBy = OrderBy.DESC;
}
