import { Role, User } from '../../generated/prisma/client';

export class UserResponseDto {
  id!: string;
  email!: string;
  firstName!: string | null;
  lastName!: string | null;
  name!: string;
  createdAt!: Date;
  // Ajout IA: expose le role dans les responses user.
  role!: Role;

  static fromPrisma(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.firstName = user.firstName;
    dto.lastName = user.lastName;
    dto.name = user.name;
    dto.createdAt = user.createdAt;
    dto.role = user.role;
    return dto;
  }
}
