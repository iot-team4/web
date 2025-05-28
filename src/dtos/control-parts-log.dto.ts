import { ControlPartsDto } from '@src/dtos/control-parts.dto';
import { ControlSource } from '@src/enums/control-parts.enum';
import { IsDate, IsEnum } from 'class-validator';

export class ControlPartsLogDto extends ControlPartsDto {
  @IsEnum(ControlSource)
  source: ControlSource;

  @IsDate()
  createdAt: Date;

  constructor(controlParts: ControlPartsDto, source: ControlSource) {
    super();
    this.target = controlParts.target;
    this.action = controlParts.action;
    this.createdAt = new Date();
    this.source = source;
  }
}
