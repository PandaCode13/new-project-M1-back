import { Injectable } from '@nestjs/common';
import { Role, User, Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OffsetPaginationParams } from '../common/pipes/offset-pagination.pipe';
import { CursorPaginationParams } from '../common/pipes/cursor-pagination.pipe';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(pagination: OffsetPaginationParams, role?: Role): Promise<User[]> {
    // Ajout IA: filtre optionnel par role directement dans Prisma.
    return this.prisma.user.findMany({
      where: role ? { role } : undefined,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  findAllWithCursor(params: CursorPaginationParams): Promise<User[]> {
    return this.prisma.user.findMany({
      // Fetch one extra item to determine whether a next page exists
      take: params.limit + 1,
      cursor: params.cursor ? { id: params.cursor } : undefined,
      // Skip the cursor item itself — it was already returned in the previous page
      skip: params.cursor ? 1 : 0,
      orderBy: { createdAt: 'desc' },
    });
  }

  count(role?: Role): Promise<number> {
    return this.prisma.user.count({
      where: role ? { role } : undefined,
    });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  delete(id: string): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }

  addToWishlist(userId: string, parkId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { wishlist: { connect: { id: parkId } } },
    });
  }

  removeFromWishlist(userId: string, parkId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { wishlist: { disconnect: { id: parkId } } },
    });
  }

  findWishlist(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { wishlist: { take: 20, orderBy: { name: 'asc' } } },
    });
  }

  updateRole(id: string, role: Role): Promise<User> {
    // Ajout IA: persistence du nouveau role utilisateur.
    return this.prisma.user.update({
      where: { id },
      data: { role },
    });
  }
}
