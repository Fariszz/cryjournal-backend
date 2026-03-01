import { count } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { AnyPgTable } from 'drizzle-orm/pg-core';
import { seed } from 'drizzle-seed';
import * as schema from '../../src/db/schema';
import type { SeedTransaction } from './admin.seed';

const DEFAULT_ROW_COUNT = 6;
const DETERMINISTIC_SEED = 20260301;

interface TableRef {
  name: string;
  table: AnyPgTable;
}

const TABLES_TO_SEED: TableRef[] = [
  { name: 'account_groups', table: schema.accountGroups },
  { name: 'accounts', table: schema.accounts },
  { name: 'instruments', table: schema.instruments },
  { name: 'strategies', table: schema.strategies },
  { name: 'strategy_steps', table: schema.strategySteps },
  { name: 'strategy_confluences', table: schema.strategyConfluences },
  { name: 'demons', table: schema.demons },
  { name: 'trades', table: schema.trades },
  { name: 'trade_tags', table: schema.tradeTags },
  { name: 'trade_tag_pivot', table: schema.tradeTagPivot },
  { name: 'trade_demon_pivot', table: schema.tradeDemonPivot },
  { name: 'market_condition_tags', table: schema.marketConditionTags },
  { name: 'market_conditions', table: schema.marketConditions },
  {
    name: 'trade_market_condition_tag_pivot',
    table: schema.tradeMarketConditionTagPivot,
  },
  {
    name: 'trade_market_condition_pivot',
    table: schema.tradeMarketConditionPivot,
  },
  { name: 'trade_attachments', table: schema.tradeAttachments },
  { name: 'trade_confluence_checks', table: schema.tradeConfluenceChecks },
  { name: 'trade_context_events', table: schema.tradeContextEvents },
  { name: 'daily_journals', table: schema.dailyJournals },
  { name: 'daily_journal_trades', table: schema.dailyJournalTrades },
  { name: 'daily_journal_demons', table: schema.dailyJournalDemons },
  {
    name: 'daily_journal_attachments',
    table: schema.dailyJournalAttachments,
  },
  { name: 'demon_evidence_logs', table: schema.demonEvidenceLogs },
  { name: 'demon_performance_logs', table: schema.demonPerformanceLogs },
  { name: 'app_settings', table: schema.appSettings },
];

const DRIZZLE_SEED_SCHEMA = {
  accountGroups: schema.accountGroups,
  accounts: schema.accounts,
  instruments: schema.instruments,
  strategies: schema.strategies,
  strategySteps: schema.strategySteps,
  strategyConfluences: schema.strategyConfluences,
  demons: schema.demons,
  trades: schema.trades,
  tradeTags: schema.tradeTags,
  marketConditionTags: schema.marketConditionTags,
  marketConditions: schema.marketConditions,
  tradeAttachments: schema.tradeAttachments,
  tradeContextEvents: schema.tradeContextEvents,
  appSettings: schema.appSettings,
};

export interface DummySeedResult {
  skipped: boolean;
  populatedTables: Array<{ table: string; count: number }>;
  targetRowsPerTable: number;
}

async function getRowCount(
  tx: SeedTransaction,
  table: AnyPgTable,
): Promise<number> {
  const [result] = await tx.select({ count: count() }).from(table);
  return Number(result?.count ?? 0);
}

function toYmd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function buildUniquePairs<A, B>(
  left: readonly A[],
  right: readonly B[],
  desired: number,
): Array<{ left: A; right: B }> {
  const pairs: Array<{ left: A; right: B }> = [];
  for (const leftValue of left) {
    for (const rightValue of right) {
      if (pairs.length >= desired) {
        return pairs;
      }
      pairs.push({ left: leftValue, right: rightValue });
    }
  }
  return pairs;
}

async function seedConstrainedTables(tx: SeedTransaction): Promise<void> {
  const tradesRows = await tx
    .select({ id: schema.trades.id })
    .from(schema.trades);
  const tradeTagsRows = await tx
    .select({ id: schema.tradeTags.id })
    .from(schema.tradeTags);
  const demonsRows = await tx
    .select({ id: schema.demons.id })
    .from(schema.demons);
  const marketConditionTagsRows = await tx
    .select({ id: schema.marketConditionTags.id })
    .from(schema.marketConditionTags);
  const marketConditionsRows = await tx
    .select({ id: schema.marketConditions.id })
    .from(schema.marketConditions);
  const accountsRows = await tx
    .select({ id: schema.accounts.id })
    .from(schema.accounts);
  const strategyConfluencesRows = await tx
    .select({ id: schema.strategyConfluences.id })
    .from(schema.strategyConfluences);

  const tradeIds = tradesRows.map((row) => row.id);
  const tradeTagIds = tradeTagsRows.map((row) => row.id);
  const demonIds = demonsRows.map((row) => row.id);
  const marketConditionTagIds = marketConditionTagsRows.map((row) => row.id);
  const marketConditionIds = marketConditionsRows.map((row) => row.id);
  const accountIds = accountsRows.map((row) => row.id);
  const confluenceIds = strategyConfluencesRows.map((row) => row.id);

  if (
    tradeIds.length === 0 ||
    tradeTagIds.length === 0 ||
    demonIds.length === 0 ||
    marketConditionTagIds.length === 0 ||
    marketConditionIds.length === 0 ||
    accountIds.length === 0 ||
    confluenceIds.length === 0
  ) {
    throw new Error(
      'Cannot seed constrained tables because required parent rows are missing.',
    );
  }

  const tradeTagPairs = buildUniquePairs(
    tradeIds,
    tradeTagIds,
    DEFAULT_ROW_COUNT,
  );
  await tx
    .insert(schema.tradeTagPivot)
    .values(
      tradeTagPairs.map((pair) => ({
        tradeId: pair.left,
        tagId: pair.right,
      })),
    )
    .onConflictDoNothing();

  const tradeDemonPairs = buildUniquePairs(
    tradeIds,
    demonIds,
    DEFAULT_ROW_COUNT,
  );
  await tx
    .insert(schema.tradeDemonPivot)
    .values(
      tradeDemonPairs.map((pair) => ({
        tradeId: pair.left,
        demonId: pair.right,
      })),
    )
    .onConflictDoNothing();

  const tradeMarketConditionTagPairs = buildUniquePairs(
    tradeIds,
    marketConditionTagIds,
    DEFAULT_ROW_COUNT,
  );
  await tx
    .insert(schema.tradeMarketConditionTagPivot)
    .values(
      tradeMarketConditionTagPairs.map((pair) => ({
        tradeId: pair.left,
        marketConditionTagId: pair.right,
      })),
    )
    .onConflictDoNothing();

  const tradeMarketConditionPairs = buildUniquePairs(
    tradeIds,
    marketConditionIds,
    DEFAULT_ROW_COUNT,
  );
  await tx
    .insert(schema.tradeMarketConditionPivot)
    .values(
      tradeMarketConditionPairs.map((pair) => ({
        tradeId: pair.left,
        marketConditionId: pair.right,
      })),
    )
    .onConflictDoNothing();

  const today = new Date();
  const dailyJournalValues = Array.from(
    { length: DEFAULT_ROW_COUNT },
    (_, index) => {
      const date = new Date(today);
      date.setUTCDate(today.getUTCDate() - (DEFAULT_ROW_COUNT - 1 - index));

      return {
        date: toYmd(date),
        accountId: accountIds[index % accountIds.length],
        mood: 6 + (index % 3),
        energy: 6 + ((index + 1) % 3),
        focus: 6 + ((index + 2) % 3),
        confidence: 6 + (index % 3),
        plan: `Plan ${index + 1}`,
        executionNotes: `Execution notes ${index + 1}`,
        lessons: `Lessons ${index + 1}`,
        nextActions: `Next actions ${index + 1}`,
      };
    },
  );

  await tx
    .insert(schema.dailyJournals)
    .values(dailyJournalValues)
    .onConflictDoNothing();

  const dailyJournalRows = await tx
    .select({ id: schema.dailyJournals.id })
    .from(schema.dailyJournals);
  const dailyJournalIds = dailyJournalRows.map((row) => row.id);

  if (dailyJournalIds.length === 0) {
    throw new Error('Failed to create daily journals.');
  }

  const journalTradePairs = buildUniquePairs(
    dailyJournalIds,
    tradeIds,
    DEFAULT_ROW_COUNT,
  );
  await tx
    .insert(schema.dailyJournalTrades)
    .values(
      journalTradePairs.map((pair) => ({
        dailyJournalId: pair.left,
        tradeId: pair.right,
      })),
    )
    .onConflictDoNothing();

  const journalDemonPairs = buildUniquePairs(
    dailyJournalIds,
    demonIds,
    DEFAULT_ROW_COUNT,
  );
  await tx
    .insert(schema.dailyJournalDemons)
    .values(
      journalDemonPairs.map((pair) => ({
        dailyJournalId: pair.left,
        demonId: pair.right,
      })),
    )
    .onConflictDoNothing();

  await tx
    .insert(schema.dailyJournalAttachments)
    .values(
      Array.from({ length: DEFAULT_ROW_COUNT }, (_, index) => ({
        dailyJournalId: dailyJournalIds[index % dailyJournalIds.length],
        filePath: `/seed/daily-journal-${index + 1}.png`,
        caption: `Daily journal attachment ${index + 1}`,
      })),
    )
    .onConflictDoNothing();

  const tradeConfluencePairs = buildUniquePairs(
    tradeIds,
    confluenceIds,
    DEFAULT_ROW_COUNT,
  );
  await tx
    .insert(schema.tradeConfluenceChecks)
    .values(
      tradeConfluencePairs.map((pair, index) => ({
        tradeId: pair.left,
        confluenceId: pair.right,
        checked: index % 2,
        weightSnapshot: '0.500000',
      })),
    )
    .onConflictDoNothing();

  await tx
    .insert(schema.demonPerformanceLogs)
    .values(
      Array.from({ length: DEFAULT_ROW_COUNT }, (_, index) => {
        const date = new Date(today);
        date.setUTCDate(today.getUTCDate() - (DEFAULT_ROW_COUNT - 1 - index));
        return {
          demonId: demonIds[index % demonIds.length],
          date: toYmd(date),
          densityScore: '0.500000',
          pnlWhenPresent: '100.00000000',
          pnlWhenAbsent: '-50.00000000',
          winratePresent: '0.550000',
          winrateAbsent: '0.450000',
          snapshotJson: { seeded: true, index: index + 1 },
        };
      }),
    )
    .onConflictDoNothing();

  await tx
    .insert(schema.demonEvidenceLogs)
    .values(
      Array.from({ length: DEFAULT_ROW_COUNT }, (_, index) => ({
        demonId: demonIds[index % demonIds.length],
        tradeId: tradeIds[index % tradeIds.length],
        dailyJournalId: dailyJournalIds[index % dailyJournalIds.length],
        note: `Demon evidence ${index + 1}`,
        screenshotPath: `/seed/demon-evidence-${index + 1}.png`,
      })),
    )
    .onConflictDoNothing();
}

export async function seedDummyData(
  tx: SeedTransaction,
): Promise<DummySeedResult> {
  console.log('[seed:dummy] checking existing data for idempotency');

  const populatedTables: Array<{ table: string; count: number }> = [];

  for (const item of TABLES_TO_SEED) {
    const rows = await getRowCount(tx, item.table);
    if (rows > 0) {
      populatedTables.push({ table: item.name, count: rows });
    }
  }

  if (populatedTables.length > 0) {
    console.log(
      `[seed:dummy] skipped because data already exists in ${populatedTables.length} table(s)`,
    );
    return {
      skipped: true,
      populatedTables,
      targetRowsPerTable: DEFAULT_ROW_COUNT,
    };
  }

  const txAsDb = tx as unknown as NodePgDatabase<typeof DRIZZLE_SEED_SCHEMA>;

  await seed(txAsDb, DRIZZLE_SEED_SCHEMA, {
    count: DEFAULT_ROW_COUNT,
    seed: DETERMINISTIC_SEED,
  }).refine((funcs) => ({
    instruments: {
      columns: {
        symbol: funcs.string({ isUnique: true }),
      },
    },
  }));

  await seedConstrainedTables(tx);

  console.log('[seed:dummy] dummy data inserted');

  return {
    skipped: false,
    populatedTables: [],
    targetRowsPerTable: DEFAULT_ROW_COUNT,
  };
}
