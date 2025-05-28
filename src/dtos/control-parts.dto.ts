import { TargetType } from '@src/enums/control-parts.enum';
import { IsValidActionForTargetConstraint } from '@src/validators/action-for-target.validator';
import { IsEnum, Validate } from 'class-validator';

export class ControlPartsDto {
  @IsEnum(TargetType)
  target: TargetType;

  @Validate(IsValidActionForTargetConstraint)
  action: string;
}
