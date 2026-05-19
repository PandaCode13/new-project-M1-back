import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { ParkResponseDto } from '../parks/dto/park-response.dto';
import { OffsetPaginationPipe } from '../common/pipes/offset-pagination.pipe';
import type { OffsetPaginationParams } from '../common/pipes/offset-pagination.pipe';
import { CursorPaginationPipe } from '../common/pipes/cursor-pagination.pipe';
import type { CursorPaginationParams } from '../common/pipes/cursor-pagination.pipe';
import { UUIDParam } from '../common/decorators/uuid-param.decorator';
import { DeleteRoute } from '../common/decorators/delete-route.decorator';
import { Role } from '../generated/prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guards';
import { RoleQueryPipe } from '../common/pipes/role-query.pipe';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    return UserResponseDto.fromPrisma(user);
  }

  // Ajout IA: route reservee aux admins, avec filtre optionnel par role.
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  async findAll(
    @Query(OffsetPaginationPipe) pagination: OffsetPaginationParams,
    @Query('role', RoleQueryPipe) role?: Role,
  ) {
    const { data, total, page, limit, totalPages } =
      await this.usersService.findAll(pagination, role);
    return {
      data: data.map((user) => UserResponseDto.fromPrisma(user)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  // Must be declared before :id to avoid route conflict
  @Get('cursor')
  async findAllWithCursor(
    @Query(CursorPaginationPipe) params: CursorPaginationParams,
  ) {
    const { data, nextCursor, hasNextPage } =
      await this.usersService.findAllWithCursor(params);
    return {
      data: data.map((user) => UserResponseDto.fromPrisma(user)),
      nextCursor,
      hasNextPage,
    };
  }

  @Get(':id')
  async findOne(@UUIDParam('id') id: string) {
    const user = await this.usersService.findOne(id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return UserResponseDto.fromPrisma(user);
  }

  @Patch(':id')
  async update(@UUIDParam('id') id: string, @Body() dto: UpdateUserDto) {
    const user = await this.usersService.update(id, dto);
    return UserResponseDto.fromPrisma(user);
  }

  // Ajout IA: endpoint dedie au changement de role utilisateur.
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/role')
  async updateRole(
    @UUIDParam('id') id: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    const user = await this.usersService.updateRole(id, dto.role);
    return UserResponseDto.fromPrisma(user);
  }

  // @DeleteRoute() = @Delete(':id') + @HttpCode(204) — composition decorator
  @DeleteRoute()
  async remove(@UUIDParam('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post(':id/wishlist/:parkId')
  addToWishlist(
    @UUIDParam('id') id: string,
    @UUIDParam('parkId') parkId: string,
  ) {
    return this.usersService.addToWishlist(id, parkId);
  }

  // Path differs from :id pattern — @DeleteRoute() doesn't apply here
  @Delete(':id/wishlist/:parkId')
  @HttpCode(204)
  removeFromWishlist(
    @UUIDParam('id') id: string,
    @UUIDParam('parkId') parkId: string,
  ) {
    return this.usersService.removeFromWishlist(id, parkId);
  }

  @Get(':id/wishlist')
  async getWishlist(@UUIDParam('id') id: string) {
    const parks = await this.usersService.getWishlist(id);
    return parks.map((p) => ParkResponseDto.fromPrisma(p));
  }
}
