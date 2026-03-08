import type { TradeResponse } from './trade.response';

export interface TradesListResponse {
  rows: TradeResponse[];
  meta: {
    page: number;
    page_size: number;
    total: number;
  };
}
