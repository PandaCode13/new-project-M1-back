import { Park } from '../../generated/prisma/client';

export class ParkResponseDto {
  id: string;
  name: string;
  city: string;
  country: string;
  isActive: boolean;
  createdAt: Date;

  static fromPrisma(park: Park): ParkResponseDto {
    const dto = new ParkResponseDto();
    dto.id = park.id;
    dto.name = park.name;
    dto.city = park.city;
    dto.country = park.country;
    dto.isActive = park.isActive;
    dto.createdAt = park.createdAt;
    return dto;
  }
}
