import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateParkDto } from './dto/create-park.dto';
import { UpdateParkDto } from './dto/update-park.dto';
import { ParksRepository } from './parks.repository';
import { RollerCoastersRepository } from '../roller-coasters/roller-coasters.repository';

@Injectable()
export class ParksService {
  constructor(
    private readonly parks: ParksRepository,
    private readonly rollerCoasters: RollerCoastersRepository,
  ) {}

  findAll() {
    return this.parks.findAll();
  }

  async findOne(id: string) {
    const park = await this.parks.findById(id);
    if (!park) {
      throw new NotFoundException(`Park ${id} not found`);
    }
    return park;
  }

  create(dto: CreateParkDto) {
    return this.parks.create(dto);
  }

  async update(id: string, dto: UpdateParkDto) {
    await this.findOne(id);
    return this.parks.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.parks.delete(id);
  }

  async findRollerCoasters(parkId: string, isOperational?: boolean) {
    await this.findOne(parkId); // throws 404 if park not found
    return this.rollerCoasters.findByPark(parkId, isOperational);
  }
}
