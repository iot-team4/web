import { ControlPartsDto } from '@src/dtos/control-parts.dto';
import { AutoFanAction, LedFanAction, TargetType } from '@src/enums/control-parts.enum';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidActionForTarget', async: false })
export class IsValidActionForTargetConstraint implements ValidatorConstraintInterface {
  validate(action: string, args: ValidationArguments) {
    const object = args.object as ControlPartsDto;
    const target = object.target;

    if (!target) return false;

    switch (target) {
      case TargetType.LED:
      case TargetType.FAN:
        return Object.values(LedFanAction).includes(action as LedFanAction);
      case TargetType.AUTO_FAN:
        return Object.values(AutoFanAction).includes(action as AutoFanAction);
      default:
        return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    const object = args.object as ControlPartsDto;
    const target = object.target;

    if (target === TargetType.LED || target === TargetType.FAN) {
      return `Action for target '${target}' must be one of: ${Object.values(LedFanAction).join(', ')}`;
    }
    if (target === TargetType.AUTO_FAN) {
      return `Action for target '${target}' must be one of: ${Object.values(AutoFanAction).join(', ')}`;
    }

    return 'Invalid action for the given target.';
  }
}
