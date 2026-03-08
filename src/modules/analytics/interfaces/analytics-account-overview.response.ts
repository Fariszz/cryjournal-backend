export interface AnalyticsAccountOverviewResponse {
  account: {
    id: string;
    name: string;
    account_type: string;
    base_currency: string;
    timezone: string;
  };
  kpis: {
    trades_count: number;
    executed_count: number;
    missed_count: number;
    net_pnl: number;
    win_rate: number;
    avg_r: number;
    profit_factor: number;
    max_drawdown: number;
  };
  pnl_calendar: Array<{
    date: string;
    pnl: number;
    trades: number;
  }>;
}
