export interface EconomicCalendarEvent {
  id: string;
  title: string;
  impact?: string | undefined;
  currency?: string | undefined;
  eventTime: string;
  raw?: Record<string, unknown> | undefined;
}

export interface EconomicCalendarProvider {
  getEvents(input: {
    from: string;
    to: string;
    impact?: string | undefined;
    currency?: string | undefined;
  }): Promise<EconomicCalendarEvent[]>;
}

export const ECONOMIC_CALENDAR_PROVIDER = 'ECONOMIC_CALENDAR_PROVIDER';
