import { pgEnum } from 'drizzle-orm/pg-core';
import { AccountTypeEnum } from '@common/enums/account-type.enum';
import { TradeDirectionEnum } from '@common/enums/trade-direction.enum';
import { TradeHoldingBucketEnum } from '@common/enums/trade-holding-bucket.enum';
import { TradeMarginModeEnum } from '@common/enums/trade-margin-mode.enum';
import { TradePositionSizeUnitEnum } from '@common/enums/trade-position-size-unit.enum';
import { TradePositionTypeEnum } from '@common/enums/trade-position-type.enum';
import { TradeTypeEnum } from '@common/enums/trade-type.enum';
import { TradeWinLossFlagEnum } from '@common/enums/trade-win-loss-flag.enum';

export const accountTypeEnum = pgEnum(
  'account_type',
  Object.values(AccountTypeEnum) as [AccountTypeEnum, ...AccountTypeEnum[]],
);
export const tradeTypeEnum = pgEnum(
  'trade_type',
  Object.values(TradeTypeEnum) as [TradeTypeEnum, ...TradeTypeEnum[]],
);
export const directionEnum = pgEnum(
  'direction',
  Object.values(TradeDirectionEnum) as [
    TradeDirectionEnum,
    ...TradeDirectionEnum[],
  ],
);
export const positionTypeEnum = pgEnum(
  'position_type',
  Object.values(TradePositionTypeEnum) as [
    TradePositionTypeEnum,
    ...TradePositionTypeEnum[],
  ],
);
export const marginModeEnum = pgEnum(
  'margin_mode',
  Object.values(TradeMarginModeEnum) as [
    TradeMarginModeEnum,
    ...TradeMarginModeEnum[],
  ],
);
export const winLossFlagEnum = pgEnum(
  'win_loss_flag',
  Object.values(TradeWinLossFlagEnum) as [
    TradeWinLossFlagEnum,
    ...TradeWinLossFlagEnum[],
  ],
);
export const holdingBucketEnum = pgEnum(
  'holding_bucket',
  Object.values(TradeHoldingBucketEnum) as [
    TradeHoldingBucketEnum,
    ...TradeHoldingBucketEnum[],
  ],
);
export const positionSizeUnitEnum = pgEnum(
  'position_size_unit',
  Object.values(TradePositionSizeUnitEnum) as [
    TradePositionSizeUnitEnum,
    ...TradePositionSizeUnitEnum[],
  ],
);
