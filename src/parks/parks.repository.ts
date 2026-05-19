import { Injectable } from '@nestjs/common';
import { Park, Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ParksRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Park[]> {
    return this.prisma.park.findMany({ orderBy: { name: 'asc' } });
  }

  findById(id: string): Promise<Park | null> {
    return this.prisma.park.findUnique({ where: { id } });
  }

  create(data: Prisma.ParkCreateInput): Promise<Park> {
    return this.prisma.park.create({ data });
  }

  update(id: string, data: Prisma.ParkUpdateInput): Promise<Park> {
    return this.prisma.park.update({ where: { id }, data });
  }

  delete(id: string): Promise<Park> {
    return this.prisma.park.delete({ where: { id } });
  }
}
