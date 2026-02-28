export interface EconomicCalendarEvent {
  id: string;
  title: string;
  impact?: string;
  currency?: string;
  eventTime: string;
  raw?: Record<string, unknown>;
}

export interface EconomicCalendarProvider {
  getEvents(input: {
    from: string;
    to: string;
    impact?: string;
    currency?: string;
  }): Promise<EconomicCalendarEvent[]>;
}

export const ECONOMIC_CALENDAR_PROVIDER = 'ECONOMIC_CALENDAR_PROVIDER';
