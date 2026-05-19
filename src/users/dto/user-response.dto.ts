import { User } from '../../generated/prisma/client';

export class UserResponseDto {
  id!: string;
  email!: string;
  firstName!: string | null;
  lastName!: string | null;
  name!: string;
  createdAt!: Date;

  static fromPrisma(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.firstName = user.firstName;
    dto.lastName = user.lastName;
    dto.name = user.name;
    dto.createdAt = user.createdAt;
    return dto;
  }
}
