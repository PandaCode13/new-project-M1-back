import { Module } from '@nestjs/common';
import { RollerCoastersController } from './roller-coasters.controller';
import { RollerCoastersService } from './roller-coasters.service';
import { RollerCoastersRepository } from './roller-coasters.repository';

@Module({
  controllers: [RollerCoastersController],
  providers: [RollerCoastersService, RollerCoastersRepository],
  exports: [RollerCoastersRepository],
})
export class RollerCoastersModule {}
