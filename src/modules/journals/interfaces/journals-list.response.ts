import type { JournalResponse } from './journal.response';

export interface JournalsListResponse {
  rows: JournalResponse[];
  meta: {
    page: number;
    page_size: number;
    total: number;
  };
}
