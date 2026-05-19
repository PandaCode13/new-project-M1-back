import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '../generated/prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './users.repository';
import { OffsetPaginationParams } from '../common/pipes/offset-pagination.pipe';
import { CursorPaginationParams } from '../common/pipes/cursor-pagination.pipe';
import { ParksService } from '../parks/parks.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly user: UserRepository,
    private readonly parks: ParksService,
  ) {}

  async create(dto: CreateUserDto) {
    const existing = await this.user.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }
    return this.user.create({
      ...dto,
      name: `${dto.firstName} ${dto.lastName}`,
    });
  }

  async findAll(pagination: OffsetPaginationParams, role?: Role) {
    // Ajout IA: le role est optionnel et permet de filtrer les users en base.
    const [data, total] = await Promise.all([
      this.user.findAll(pagination, role),
      this.user.count(role),
    ]);

    return {
      data,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async findAllWithCursor(params: CursorPaginationParams) {
    const items = await this.user.findAllWithCursor(params);

    const hasNextPage = items.length > params.limit;
    const data = hasNextPage ? items.slice(0, params.limit) : items;
    const nextCursor = hasNextPage ? (data[data.length - 1]?.id ?? null) : null;

    return { data, nextCursor, hasNextPage };
  }

  findOne(id: string) {
    return this.user.findById(id);
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.user.findById(id);
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return this.user.update(id, dto);
  }

  async remove(id: string) {
    const existing = await this.user.findById(id);
    if (!existing) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return this.user.delete(id);
  }

  async addToWishlist(userId: string, parkId: string) {
    const user = await this.user.findById(userId);
    if (!user) throw new NotFoundException(`User ${userId} not found`);
    const park = await this.parks.findOne(parkId);
    if (!park.isActive) {
      throw new BadRequestException('Cannot add an inactive park to wishlist');
    }
    return this.user.addToWishlist(userId, parkId);
  }

  async removeFromWishlist(userId: string, parkId: string) {
    const user = await this.user.findById(userId);
    if (!user) throw new NotFoundException(`User ${userId} not found`);
    return this.user.removeFromWishlist(userId, parkId);
  }

  async getWishlist(userId: string) {
    const result = await this.user.findWishlist(userId);
    if (!result) throw new NotFoundException(`User ${userId} not found`);
    return result.wishlist;
  }

  async updateRole(id: string, role: Role) {
    const user = await this.user.findById(id);
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    // Ajout IA: changement de role centralise dans le service.
    return this.user.updateRole(id, role);
  }
}
