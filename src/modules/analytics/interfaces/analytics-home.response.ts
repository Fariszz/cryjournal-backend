export interface AnalyticsHomeResponse {
  summary: {
    net_pnl: number;
    gross_profit: number;
    gross_loss: number;
    profit_factor: number;
    win_rate: number;
    avg_win: number;
    avg_loss: number;
    consistency_rating: number;
    max_drawdown: number;
  };
  equity_curve: Array<{
    date: string;
    equity: number;
    pnl: number;
  }>;
  session_breakdown: Array<{
    session: string;
    trades: number;
    net_pnl: number;
    win_rate: number;
  }>;
  recent_trades: Array<{
    trade_id: string;
    symbol: string;
    pnl: number;
    entry_datetime: Date;
  }>;
}
