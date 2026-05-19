import { Module } from '@nestjs/common';
import { ParksController } from './parks.controller';
import { ParksService } from './parks.service';
import { ParksRepository } from './parks.repository';
import { RollerCoastersModule } from '../roller-coasters/roller-coasters.module';

@Module({
  imports: [RollerCoastersModule],
  controllers: [ParksController],
  providers: [ParksService, ParksRepository],
  exports: [ParksService],
})
export class ParksModule {}
