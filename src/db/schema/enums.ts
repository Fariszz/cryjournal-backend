import { pgEnum } from 'drizzle-orm/pg-core';

export const accountTypeEnum = pgEnum('account_type', [
  'crypto',
  'forex',
  'stocks',
]);
export const tradeTypeEnum = pgEnum('trade_type', ['executed', 'missed']);
export const directionEnum = pgEnum('direction', ['long', 'short']);
export const positionTypeEnum = pgEnum('position_type', ['spot', 'futures']);
export const marginModeEnum = pgEnum('margin_mode', ['cross', 'isolated']);
export const winLossFlagEnum = pgEnum('win_loss_flag', [
  'win',
  'loss',
  'breakeven',
]);
export const holdingBucketEnum = pgEnum('holding_bucket', [
  'scalp',
  'intraday',
  'swing',
  'position',
]);
export const positionSizeUnitEnum = pgEnum('position_size_unit', [
  'lot',
  'usd',
  'contract',
]);
