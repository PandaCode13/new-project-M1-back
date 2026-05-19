import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateRollerCoasterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsInt()
  @Min(0)
  heightRequirementCm: number;

  @IsNumber()
  @Min(0)
  maxSpeedKmh: number;

  @IsInt()
  @Min(1)
  @Max(5)
  thrillLevel: number;

  @IsUUID()
  parkId: string;

  @IsBoolean()
  @IsOptional()
  isOperational?: boolean;
}
