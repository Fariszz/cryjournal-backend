import { Module } from '@nestjs/common';
import { StorageModule } from '../../common/storage/storage.module';
import { StrategiesModule } from '../strategies/strategies.module';
import { TradesController } from './trades.controller';
import { TradesService } from './trades.service';

@Module({
  imports: [StorageModule, StrategiesModule],
  controllers: [TradesController],
  providers: [TradesService],
  exports: [TradesService],
})
export class TradesModule {}
