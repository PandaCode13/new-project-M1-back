import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRollerCoasterDto } from './dto/create-roller-coaster.dto';
import { UpdateRollerCoasterDto } from './dto/update-roller-coaster.dto';
import { RollerCoastersRepository } from './roller-coasters.repository';

@Injectable()
export class RollerCoastersService {
  constructor(private readonly rollerCoasters: RollerCoastersRepository) {}

  findAll() {
    return this.rollerCoasters.findAll();
  }

  async findOne(id: string) {
    const rc = await this.rollerCoasters.findById(id);
    if (!rc) {
      throw new NotFoundException(`RollerCoaster ${id} not found`);
    }
    return rc;
  }

  create(dto: CreateRollerCoasterDto) {
    const { parkId, ...rest } = dto;
    return this.rollerCoasters.create({
      ...rest,
      park: { connect: { id: parkId } },
    });
  }

  async update(id: string, dto: UpdateRollerCoasterDto) {
    await this.findOne(id);
    return this.rollerCoasters.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.rollerCoasters.delete(id);
  }
}
