export interface StrategyAnalyticsResponse {
  kpis: {
    trades_count: number;
    net_pnl: number;
    win_rate: number;
  };
  trades: Array<{
    id: string;
    accountId: string;
    instrumentId: string;
    pnl: string | null;
    entryDatetime: Date;
  }>;
}
