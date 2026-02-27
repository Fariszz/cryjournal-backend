import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { accounts } from './accounts.schema';
import {
  createdAt,
  deletedAt,
  numericMoney,
  numericRatio,
  updatedAt,
  uuidPk,
} from './common';
import {
  directionEnum,
  holdingBucketEnum,
  marginModeEnum,
  positionSizeUnitEnum,
  positionTypeEnum,
  tradeTypeEnum,
  winLossFlagEnum,
} from './enums';
import { instruments } from './instruments.schema';
import { strategyConfluences, strategies } from './strategies.schema';
import { demons } from './demons.schema';

export const trades = pgTable(
  'trades',
  {
    id: uuidPk(),
    accountId: uuid('account_id')
      .notNull()
      .references(() => accounts.id),
    type: tradeTypeEnum('type').notNull(),
    instrumentId: uuid('instrument_id')
      .notNull()
      .references(() => instruments.id),
    direction: directionEnum('direction').notNull(),
    timezone: varchar('timezone', { length: 64 }).notNull(),
    entryDatetime: timestamp('entry_datetime', {
      withTimezone: true,
    }).notNull(),
    exitDatetime: timestamp('exit_datetime', { withTimezone: true }),
    entryTimeframe: varchar('entry_timeframe', { length: 32 }),
    tradingSession: varchar('trading_session', { length: 32 }),
    entryPrice: numericMoney('entry_price'),
    exitPrice: numericMoney('exit_price'),
    stopLoss: numericMoney('stop_loss'),
    takeProfit: numericMoney('take_profit'),
    dollarRisk: numericMoney('dollar_risk'),
    positionSize: numericMoney('position_size'),
    positionSizeUnit: positionSizeUnitEnum('position_size_unit'),
    brokerCommission: numericMoney('broker_commission'),
    swap: numericMoney('swap'),
    fundingFee: numericMoney('funding_fee'),
    positionType: positionTypeEnum('position_type'),
    leverage: numericRatio('leverage'),
    marginMode: marginModeEnum('margin_mode'),
    strategyId: uuid('strategy_id').references(() => strategies.id, {
      onDelete: 'set null',
    }),
    thesis: text('thesis'),
    postAnalysis: text('post_analysis'),
    notes: text('notes'),
    pnl: numericMoney('pnl'),
    rMultiple: numericRatio('r_multiple'),
    winLossFlag: winLossFlagEnum('win_loss_flag'),
    holdingTimeSeconds: integer('holding_time_seconds'),
    holdingBucket: holdingBucketEnum('holding_bucket'),
    decisionQualityScore: numericRatio('decision_quality_score'),
    deletedAt: deletedAt(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    accountEntryIdx: index('trades_account_entry_datetime_idx').on(
      table.accountId,
      table.entryDatetime,
    ),
    instrumentIdx: index('trades_instrument_id_idx').on(table.instrumentId),
    strategyIdx: index('trades_strategy_id_idx').on(table.strategyId),
  }),
);

export const tradeTags = pgTable('trade_tags', {
  id: uuidPk(),
  name: varchar('name', { length: 120 }).notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const tradeTagPivot = pgTable(
  'trade_tag_pivot',
  {
    tradeId: uuid('trade_id')
      .notNull()
      .references(() => trades.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tradeTags.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    uniquePair: uniqueIndex('trade_tag_pivot_unique').on(
      table.tradeId,
      table.tagId,
    ),
    tradeIdx: index('trade_tag_pivot_trade_idx').on(table.tradeId),
    tagIdx: index('trade_tag_pivot_tag_idx').on(table.tagId),
  }),
);

export const tradeDemonPivot = pgTable(
  'trade_demon_pivot',
  {
    tradeId: uuid('trade_id')
      .notNull()
      .references(() => trades.id, { onDelete: 'cascade' }),
    demonId: uuid('demon_id')
      .notNull()
      .references(() => demons.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    uniquePair: uniqueIndex('trade_demon_pivot_unique').on(
      table.tradeId,
      table.demonId,
    ),
    tradeIdx: index('trade_demon_pivot_trade_idx').on(table.tradeId),
    demonIdx: index('trade_demon_pivot_demon_idx').on(table.demonId),
  }),
);

export const marketConditionTags = pgTable('market_condition_tags', {
  id: uuidPk(),
  key: varchar('key', { length: 64 }).notNull(),
  label: varchar('label', { length: 128 }).notNull(),
});

export const marketConditions = pgTable('market_conditions', {
  id: uuidPk(),
  key: varchar('key', { length: 64 }).notNull(),
  label: varchar('label', { length: 128 }).notNull(),
});

export const tradeMarketConditionTagPivot = pgTable(
  'trade_market_condition_tag_pivot',
  {
    tradeId: uuid('trade_id')
      .notNull()
      .references(() => trades.id, { onDelete: 'cascade' }),
    marketConditionTagId: uuid('market_condition_tag_id')
      .notNull()
      .references(() => marketConditionTags.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    uniquePair: uniqueIndex('trade_market_condition_tag_pivot_unique').on(
      table.tradeId,
      table.marketConditionTagId,
    ),
  }),
);

export const tradeMarketConditionPivot = pgTable(
  'trade_market_condition_pivot',
  {
    tradeId: uuid('trade_id')
      .notNull()
      .references(() => trades.id, { onDelete: 'cascade' }),
    marketConditionId: uuid('market_condition_id')
      .notNull()
      .references(() => marketConditions.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    uniquePair: uniqueIndex('trade_market_condition_pivot_unique').on(
      table.tradeId,
      table.marketConditionId,
    ),
  }),
);

export const tradeAttachments = pgTable('trade_attachments', {
  id: uuidPk(),
  tradeId: uuid('trade_id')
    .notNull()
    .references(() => trades.id, { onDelete: 'cascade' }),
  filePath: varchar('file_path', { length: 500 }).notNull(),
  caption: varchar('caption', { length: 255 }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const tradeConfluenceChecks = pgTable(
  'trade_confluence_checks',
  {
    id: uuidPk(),
    tradeId: uuid('trade_id')
      .notNull()
      .references(() => trades.id, { onDelete: 'cascade' }),
    confluenceId: uuid('confluence_id')
      .notNull()
      .references(() => strategyConfluences.id, { onDelete: 'cascade' }),
    checked: integer('checked').notNull().default(0),
    weightSnapshot: numericRatio('weight_snapshot').notNull(),
    createdAt: createdAt(),
  },
  (table) => ({
    uniquePair: uniqueIndex('trade_confluence_checks_unique').on(
      table.tradeId,
      table.confluenceId,
    ),
    tradeIdx: index('trade_confluence_checks_trade_idx').on(table.tradeId),
  }),
);

export const tradeContextEvents = pgTable('trade_context_events', {
  id: uuidPk(),
  tradeId: uuid('trade_id')
    .notNull()
    .references(() => trades.id, { onDelete: 'cascade' }),
  providerEventId: varchar('provider_event_id', { length: 128 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  impact: varchar('impact', { length: 32 }),
  currency: varchar('currency', { length: 12 }),
  eventTime: timestamp('event_time', { withTimezone: true }).notNull(),
  raw: text('raw'),
  createdAt: createdAt(),
});
