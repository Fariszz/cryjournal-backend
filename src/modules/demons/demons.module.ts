import { Module } from '@nestjs/common';
import { DemonsController } from './demons.controller';
import { DemonsService } from './demons.service';

@Module({
  controllers: [DemonsController],
  providers: [DemonsService],
  exports: [DemonsService],
})
export class DemonsModule {}
