import { Injectable } from '@nestjs/common';
import { RollerCoaster, Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const withPark = { park: true } satisfies Prisma.RollerCoasterInclude;

@Injectable()
export class RollerCoastersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.rollerCoaster.findMany({
      include: withPark,
      orderBy: { name: 'asc' },
    });
  }

  findById(id: string) {
    return this.prisma.rollerCoaster.findUnique({
      where: { id },
      include: withPark,
    });
  }

  create(data: Prisma.RollerCoasterCreateInput) {
    return this.prisma.rollerCoaster.create({ data, include: withPark });
  }

  update(id: string, data: Prisma.RollerCoasterUpdateInput) {
    return this.prisma.rollerCoaster.update({
      where: { id },
      data,
      include: withPark,
    });
  }

  delete(id: string): Promise<RollerCoaster> {
    return this.prisma.rollerCoaster.delete({ where: { id } });
  }

  findByPark(parkId: string, isOperational?: boolean) {
    return this.prisma.rollerCoaster.findMany({
      where: { parkId, ...(isOperational !== undefined && { isOperational }) },
      include: withPark,
      orderBy: { name: 'asc' },
      take: 50,
    });
  }
}
