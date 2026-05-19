import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { RollerCoastersService } from './roller-coasters.service';
import { CreateRollerCoasterDto } from './dto/create-roller-coaster.dto';
import { UpdateRollerCoasterDto } from './dto/update-roller-coaster.dto';
import { RollerCoasterResponseDto } from './dto/roller-coaster-response.dto';
import { UUIDParam } from '../common/decorators/uuid-param.decorator';
import { DeleteRoute } from '../common/decorators/delete-route.decorator';

@Controller('roller-coasters')
export class RollerCoastersController {
  constructor(private readonly rollerCoastersService: RollerCoastersService) {}

  @Post()
  async create(@Body() dto: CreateRollerCoasterDto) {
    const rc = await this.rollerCoastersService.create(dto);
    return RollerCoasterResponseDto.fromPrisma(rc);
  }

  @Get()
  async findAll() {
    const rcs = await this.rollerCoastersService.findAll();
    return rcs.map((rc) => RollerCoasterResponseDto.fromPrisma(rc));
  }

  @Get(':id')
  async findOne(@UUIDParam('id') id: string) {
    const rc = await this.rollerCoastersService.findOne(id);
    return RollerCoasterResponseDto.fromPrisma(rc);
  }

  @Patch(':id')
  async update(@UUIDParam('id') id: string, @Body() dto: UpdateRollerCoasterDto) {
    const rc = await this.rollerCoastersService.update(id, dto);
    return RollerCoasterResponseDto.fromPrisma(rc);
  }

  @DeleteRoute()
  async remove(@UUIDParam('id') id: string) {
    await this.rollerCoastersService.remove(id);
  }
}
