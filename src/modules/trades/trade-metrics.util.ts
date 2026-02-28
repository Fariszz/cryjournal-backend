type Direction = 'long' | 'short';

export interface TradeMetricInput {
  direction: Direction;
  entryPrice?: number;
  exitPrice?: number;
  positionSize?: number;
  dollarRisk?: number;
  brokerCommission?: number;
  swap?: number;
  fundingFee?: number;
  entryDatetime: Date;
  exitDatetime?: Date;
  confluenceChecks?: Array<{ checked: boolean; weight: number }>;
}

export function computeHoldingSeconds(entry: Date, exit?: Date): number | null {
  if (!exit) {
    return null;
  }
  return Math.max(0, Math.floor((exit.getTime() - entry.getTime()) / 1000));
}

export function computeHoldingBucket(
  seconds: number | null,
): 'scalp' | 'intraday' | 'swing' | 'position' | null {
  if (seconds === null) {
    return null;
  }
  if (seconds < 15 * 60) {
    return 'scalp';
  }
  if (seconds < 4 * 60 * 60) {
    return 'intraday';
  }
  if (seconds < 24 * 60 * 60) {
    return 'swing';
  }
  return 'position';
}

export function computePnl(input: TradeMetricInput): number | null {
  if (
    input.entryPrice === undefined ||
    input.exitPrice === undefined ||
    input.positionSize === undefined
  ) {
    return null;
  }
  const gross =
    input.direction === 'long'
      ? (input.exitPrice - input.entryPrice) * input.positionSize
      : (input.entryPrice - input.exitPrice) * input.positionSize;
  const fees =
    (input.brokerCommission ?? 0) + (input.swap ?? 0) + (input.fundingFee ?? 0);
  return gross - fees;
}

export function computeRMultiple(
  pnl: number | null,
  dollarRisk?: number,
): number | null {
  if (pnl === null || dollarRisk === undefined || dollarRisk <= 0) {
    return null;
  }
  return pnl / dollarRisk;
}

export function computeWinLossFlag(
  pnl: number | null,
): 'win' | 'loss' | 'breakeven' | null {
  if (pnl === null) {
    return null;
  }
  if (pnl > 0) {
    return 'win';
  }
  if (pnl < 0) {
    return 'loss';
  }
  return 'breakeven';
}

export function computeDecisionQualityScore(
  checks?: Array<{ checked: boolean; weight: number }>,
): number | null {
  if (!checks || checks.length === 0) {
    return null;
  }

  const totalWeight = checks.reduce((acc, item) => acc + item.weight, 0);
  if (totalWeight <= 0) {
    return null;
  }
  const achieved = checks.reduce(
    (acc, item) => acc + (item.checked ? item.weight : 0),
    0,
  );
  return achieved / totalWeight;
}
