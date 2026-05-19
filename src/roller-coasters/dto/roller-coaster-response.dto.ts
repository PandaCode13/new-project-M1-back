import { RollerCoaster, Park } from '../../generated/prisma/client';

type RollerCoasterWithPark = RollerCoaster & { park: Park };

export class RollerCoasterResponseDto {
  id: string;
  name: string;
  heightRequirementCm: number;
  maxSpeedKmh: number;
  thrillLevel: number;
  isOperational: boolean;
  createdAt: Date;
  park: { id: string; name: string; city: string };

  static fromPrisma(rc: RollerCoasterWithPark): RollerCoasterResponseDto {
    const dto = new RollerCoasterResponseDto();
    dto.id = rc.id;
    dto.name = rc.name;
    dto.heightRequirementCm = rc.heightRequirementCm;
    dto.maxSpeedKmh = rc.maxSpeedKmh;
    dto.thrillLevel = rc.thrillLevel;
    dto.isOperational = rc.isOperational;
    dto.createdAt = rc.createdAt;
    dto.park = { id: rc.park.id, name: rc.park.name, city: rc.park.city };
    return dto;
  }
}
