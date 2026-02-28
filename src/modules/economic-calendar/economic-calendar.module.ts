import { Module } from '@nestjs/common';
import { EconomicCalendarController } from './economic-calendar.controller';
import { EconomicCalendarService } from './economic-calendar.service';
import { ECONOMIC_CALENDAR_PROVIDER } from './economic-calendar.provider';
import { StubEconomicCalendarProvider } from './stub-economic-calendar.provider';

@Module({
  controllers: [EconomicCalendarController],
  providers: [
    EconomicCalendarService,
    StubEconomicCalendarProvider,
    {
      provide: ECONOMIC_CALENDAR_PROVIDER,
      useExisting: StubEconomicCalendarProvider,
    },
  ],
})
export class EconomicCalendarModule {}
