import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterDrizzleOrm } from '@nestjs-cls/transactional-adapter-drizzle-orm';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ClsModule } from 'nestjs-cls';
import { AccountsModule } from './modules/accounts/accounts.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AuthGuard } from './common/auth/auth.guard';
import { AuthModule } from './modules/auth/auth.module';
import { DbModule } from './db/db.module';
import { DB_PROVIDER } from './db/db.provider';
import { DemonsModule } from './modules/demons/demons.module';
import { EconomicCalendarModule } from './modules/economic-calendar/economic-calendar.module';
import { HealthController } from './health.controller';
import { ImportExportModule } from './modules/import-export/import-export.module';
import { InstrumentsModule } from './modules/instruments/instruments.module';
import { JournalsModule } from './modules/journals/journals.module';
import { SearchModule } from './modules/search/search.module';
import { SettingsModule } from './modules/settings/settings.module';
import { StrategiesModule } from './modules/strategies/strategies.module';
import { TradesModule } from './modules/trades/trades.module';
import { UsersModule } from './modules/users/users.module';
import { StorageModule } from './common/storage/storage.module';
import { LoggingModule } from './common/logging/logging.module';

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
      },
      plugins: [
        new ClsPluginTransactional({
          imports: [DbModule],
          adapter: new TransactionalAdapterDrizzleOrm({
            drizzleInstanceToken: DB_PROVIDER,
          }),
          enableTransactionProxy: true,
        }),
      ],
    }),
    DbModule,
    LoggingModule,
    StorageModule,
    UsersModule,
    AuthModule,
    SettingsModule,
    AccountsModule,
    InstrumentsModule,
    StrategiesModule,
    TradesModule,
    JournalsModule,
    DemonsModule,
    AnalyticsModule,
    SearchModule,
    ImportExportModule,
    EconomicCalendarModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
