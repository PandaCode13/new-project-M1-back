import { IsEnum } from 'class-validator';
import { Role } from '../../generated/prisma/client';

// Ajout IA: DTO dedie a la validation du changement de role utilisateur.
export class UpdateUserRoleDto {
  @IsEnum(Role)
  role: Role;
}
