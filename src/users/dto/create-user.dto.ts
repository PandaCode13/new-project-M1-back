import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s'-]+$/;
const NAME_MESSAGE =
  'Only letters, spaces, hyphens, and apostrophes are allowed';

const trimLowerCase = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class CreateUserDto {
  @Transform(trimLowerCase)
  @IsEmail({}, { message: 'Must be a valid email address' })
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @Transform(trimLowerCase)
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @Matches(NAME_REGEX, { message: NAME_MESSAGE })
  firstName: string;

  @Transform(trimLowerCase)
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @Matches(NAME_REGEX, { message: NAME_MESSAGE })
  lastName: string;
}
