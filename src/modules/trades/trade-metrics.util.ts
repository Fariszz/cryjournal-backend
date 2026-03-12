import { TradeDirectionEnum } from '@common/enums/trade-direction.enum';
import { TradeHoldingBucketEnum } from '@common/enums/trade-holding-bucket.enum';
import { TradeWinLossFlagEnum } from '@common/enums/trade-win-loss-flag.enum';

type Direction = TradeDirectionEnum;

export interface TradeMetricInput {
  direction: Direction;
  entryPrice?: number | undefined;
  exitPrice?: number | undefined;
  positionSize?: number | undefined;
  dollarRisk?: number | undefined;
  brokerCommission?: number | undefined;
  swap?: number | undefined;
  fundingFee?: number | undefined;
  entryDatetime: Date;
  exitDatetime?: Date | undefined;
  confluenceChecks?: Array<{ checked: boolean; weight: number }> | undefined;
}

export function computeHoldingSeconds(entry: Date, exit?: Date): number | null {
  if (!exit) {
    return null;
  }
  return Math.max(0, Math.floor((exit.getTime() - entry.getTime()) / 1000));
}

export function computeHoldingBucket(
  seconds: number | null,
): TradeHoldingBucketEnum | null {
  if (seconds === null) {
    return null;
  }
  if (seconds < 15 * 60) {
    return TradeHoldingBucketEnum.SCALP;
  }
  if (seconds < 4 * 60 * 60) {
    return TradeHoldingBucketEnum.INTRADAY;
  }
  if (seconds < 24 * 60 * 60) {
    return TradeHoldingBucketEnum.SWING;
  }
  return TradeHoldingBucketEnum.POSITION;
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
    input.direction === TradeDirectionEnum.LONG
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
): TradeWinLossFlagEnum | null {
  if (pnl === null) {
    return null;
  }
  if (pnl > 0) {
    return TradeWinLossFlagEnum.WIN;
  }
  if (pnl < 0) {
    return TradeWinLossFlagEnum.LOSS;
  }
  return TradeWinLossFlagEnum.BREAKEVEN;
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
