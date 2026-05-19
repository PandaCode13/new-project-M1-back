import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s'-]+$/;
const NAME_MESSAGE =
  'Only letters, spaces, hyphens, and apostrophes are allowed';

// Ajout IA: DTO conserve pour PATCH /users/:id, separe du changement de role.
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(NAME_REGEX, { message: NAME_MESSAGE })
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(NAME_REGEX, { message: NAME_MESSAGE })
  lastName?: string;
}
