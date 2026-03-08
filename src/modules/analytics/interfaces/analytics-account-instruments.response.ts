export interface AnalyticsAccountInstrumentsResponse {
  rows: Array<{
    instrument_id: string | null;
    symbol: string;
    trades: number;
    win_rate: number;
    expectancy: number;
    profit_factor: number;
    avg_r: number;
    max_drawdown: number;
    tp_capture_ratio: number;
    net_pnl: number;
  }>;
  meta: {
    page: number;
    page_size: number;
    total: number;
  };
}
