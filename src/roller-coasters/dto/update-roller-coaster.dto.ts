import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateRollerCoasterDto } from './create-roller-coaster.dto';

// parkId is excluded — a roller coaster cannot be moved to another park
export class UpdateRollerCoasterDto extends PartialType(
  OmitType(CreateRollerCoasterDto, ['parkId'] as const),
) {}
