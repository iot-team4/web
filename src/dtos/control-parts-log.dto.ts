import { ControlPartsDto } from '@src/dtos/control-parts.dto';
import { IsDate } from 'class-validator';

export class ControlPartsLogDto extends ControlPartsDto {
  @IsDate()
  createdAt: Date;

  constructor(controlParts: ControlPartsDto) {
    super();
    this.target = controlParts.target;
    this.action = controlParts.action;
    this.source = controlParts.source;
    this.createdAt = new Date();
  }
}
