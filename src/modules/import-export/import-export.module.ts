import { Module } from '@nestjs/common';
import { InstrumentsModule } from '../instruments/instruments.module';
import { TradesModule } from '../trades/trades.module';
import { ImportExportController } from './import-export.controller';
import { ImportExportService } from './import-export.service';

@Module({
  imports: [InstrumentsModule, TradesModule],
  controllers: [ImportExportController],
  providers: [ImportExportService],
})
export class ImportExportModule {}
