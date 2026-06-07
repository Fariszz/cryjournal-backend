import { Test, TestingModule } from '@nestjs/testing';
import type { DB } from '@db/client';
import { AccountsService } from './accounts.service';
import {
  accountBulkCreateSchema,
  accountBulkUpdateSchema,
} from './accounts.schemas';
import {
  ACCOUNT_TYPE_OPTIONS,
  BROKER_OPTIONS,
  CURRENCY_OPTIONS,
  TIMEZONE_OPTIONS,
} from './seeds/account-select-options.seed';
import { AccountTypeEnum } from '@common/enums/account-type.enum';

describe('AccountsService', () => {
  let service: AccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AccountsService,
          useFactory: () => new AccountsService({} as DB),
        },
      ],
    }).compile();
    service = module.get<AccountsService>(AccountsService);
  });

  it('returns static account type options with value and label fields', () => {
    const actualOptions = service.listAccountTypeOptions();
    expect(actualOptions).toEqual(ACCOUNT_TYPE_OPTIONS);
    expect(actualOptions).toEqual(
      expect.arrayContaining([
        { value: 'crypto', label: 'Crypto' },
        { value: 'forex', label: 'Forex' },
        { value: 'stocks', label: 'Stock' },
      ]),
    );
  });

  it('returns static currency options with value and label fields', () => {
    const actualOptions = service.listCurrencyOptions();
    expect(actualOptions).toEqual(CURRENCY_OPTIONS);
    expect(actualOptions).toEqual(
      expect.arrayContaining([
        { value: 'USD', label: 'US Dollar (USD)' },
        { value: 'IDR', label: 'Indonesian Rupiah (IDR)' },
      ]),
    );
  });

  it('returns static broker options with value and label fields', () => {
    const actualOptions = service.listBrokerOptions();
    expect(actualOptions).toEqual(BROKER_OPTIONS);
    expect(actualOptions).toEqual(
      expect.arrayContaining([
        { value: 'indodax', label: 'Indodax' },
        { value: 'interactive-brokers', label: 'Interactive Brokers' },
      ]),
    );
  });

  it('returns static timezone options with value and label fields', () => {
    const actualOptions = service.listTimezoneOptions();
    expect(actualOptions).toEqual(TIMEZONE_OPTIONS);
    expect(actualOptions).toEqual(
      expect.arrayContaining([
        { value: 'Asia/Jakarta', label: 'Asia/Jakarta (WIB, Indonesia)' },
        {
          value: 'America/New_York',
          label: 'America/New_York (US Eastern)',
        },
      ]),
    );
  });

  it('validates bulk create schema with at least one account', () => {
    const invalidResult = accountBulkCreateSchema.safeParse([]);
    const validResult = accountBulkCreateSchema.safeParse([
      {
        name: 'Binance Futures',
        broker: 'binance',
        accountType: AccountTypeEnum.CRYPTO,
        baseCurrency: 'USD',
        timezone: 'Asia/Jakarta',
      },
    ]);
    expect(invalidResult.success).toBe(false);
    expect(validResult.success).toBe(true);
  });

  it('validates bulk update schema requires id and at least one field', () => {
    const invalidResult = accountBulkUpdateSchema.safeParse([
      { id: '5a8f198f-31ef-4584-b806-e4f57ff52cb6' },
    ]);
    const validResult = accountBulkUpdateSchema.safeParse([
      {
        id: '5a8f198f-31ef-4584-b806-e4f57ff52cb6',
        name: 'Bybit Futures',
      },
    ]);
    expect(invalidResult.success).toBe(false);
    expect(validResult.success).toBe(true);
  });
});
