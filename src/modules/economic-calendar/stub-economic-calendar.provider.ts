import { Injectable } from '@nestjs/common';
import {
  EconomicCalendarEvent,
  EconomicCalendarProvider,
} from './economic-calendar.provider';

@Injectable()
export class StubEconomicCalendarProvider implements EconomicCalendarProvider {
  async getEvents(input: {
    from: string;
    to: string;
    impact?: string | undefined;
    currency?: string | undefined;
  }): Promise<EconomicCalendarEvent[]> {
    return [
      {
        id: `stub-${input.from}-${input.to}`,
        title: 'Stub Event',
        impact: input.impact ?? 'medium',
        currency: input.currency ?? 'USD',
        eventTime: input.from,
        raw: { provider: 'stub' },
      },
    ];
  }
}
