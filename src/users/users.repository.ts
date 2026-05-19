import { Injectable } from '@nestjs/common';
import { User, Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OffsetPaginationParams } from '../common/pipes/offset-pagination.pipe';
import { CursorPaginationParams } from '../common/pipes/cursor-pagination.pipe';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(pagination: OffsetPaginationParams): Promise<User[]> {
    return this.prisma.user.findMany({
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

  count(): Promise<number> {
    return this.prisma.user.count();
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
}
