import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { ParseBoolPipe } from '@nestjs/common';
import { ParksService } from './parks.service';
import { CreateParkDto } from './dto/create-park.dto';
import { UpdateParkDto } from './dto/update-park.dto';
import { ParkResponseDto } from './dto/park-response.dto';
import { RollerCoasterResponseDto } from '../roller-coasters/dto/roller-coaster-response.dto';
import { UUIDParam } from '../common/decorators/uuid-param.decorator';
import { DeleteRoute } from '../common/decorators/delete-route.decorator';

@Controller('parks')
export class ParksController {
  constructor(private readonly parksService: ParksService) {}

  @Post()
  async create(@Body() dto: CreateParkDto) {
    const park = await this.parksService.create(dto);
    return ParkResponseDto.fromPrisma(park);
  }

  @Get()
  async findAll() {
    const parks = await this.parksService.findAll();
    return parks.map((park) => ParkResponseDto.fromPrisma(park));
  }

  @Get(':id')
  async findOne(@UUIDParam('id') id: string) {
    const park = await this.parksService.findOne(id);
    return ParkResponseDto.fromPrisma(park);
  }

  @Patch(':id')
  async update(@UUIDParam('id') id: string, @Body() dto: UpdateParkDto) {
    const park = await this.parksService.update(id, dto);
    return ParkResponseDto.fromPrisma(park);
  }

  @DeleteRoute()
  async remove(@UUIDParam('id') id: string) {
    await this.parksService.remove(id);
  }

  @Get(':id/roller-coasters')
  async findRollerCoasters(
    @UUIDParam('id') id: string,
    @Query('isOperational', new ParseBoolPipe({ optional: true }))
    isOperational?: boolean,
  ) {
    const rcs = await this.parksService.findRollerCoasters(id, isOperational);
    return rcs.map((rc) => RollerCoasterResponseDto.fromPrisma(rc));
  }
}
