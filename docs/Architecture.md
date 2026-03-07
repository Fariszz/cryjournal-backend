# CryJournal Architecture

## Overview
CryJournal is a modular monolith built with NestJS 11 and Fastify. The application exposes a versioned REST API at `/api/v1/*`, uses PostgreSQL via Drizzle ORM, and stores uploaded files on local disk.

High-level characteristics:
- Modular feature-oriented structure under `src/modules`.
- Shared cross-cutting concerns under `src/common`.
- Database schema and migrations managed with Drizzle (`src/db`, `drizzle/`).
- Global authentication and role-based authorization by default.

## Runtime Architecture
Application bootstrap (`src/main.ts`) configures:
- Fastify adapter with `helmet`, `cookie`, and `multipart`.
- Global prefix: `/api/v1`.
- Swagger UI: `/docs` with OpenAPI JSON at `/docs/openapi.json`.
- Global `ValidationPipe` (class-transformer/class-validator behavior).
- Global response and error normalization via:
  - `ApiResponseInterceptor`
  - `AllExceptionsFilter`
- Winston-based logger (`AppLoggerService`).

## Module Composition
`AppModule` composes the system as a single deployable unit with these major layers.

### Core/Platform
- `DbModule` (global): provides Drizzle DB instance.
- `LoggingModule` (global): structured logging.
- `StorageModule`: local filesystem storage provider (`STORAGE_PROVIDER`).
- `ConfigModule` (global): environment configuration.
- `ClsModule` + transactional plugin: transaction context propagation for Drizzle.

### Security and Identity
- `RbacModule`: global guards (`JwtAuthGuard`, `RolesGuard`) through `APP_GUARD`.
- `AuthModule`: local login, JWT issuance, Google OAuth.
- `UsersModule`: profile access and admin user management.
- `RolesModule`: role lookup and default role seeding.

### Domain Modules
- `AccountsModule`: account groups, accounts, archive/restore.
- `InstrumentsModule`: instrument catalog.
- `StrategiesModule`: strategy definitions, steps, confluences, analytics.
- `TradesModule`: trade lifecycle, computed metrics, links, attachments, bulk updates.
- `JournalsModule`: daily journals, trade/demon links, attachments.
- `DemonsModule`: behavioral pattern catalog and evidence/performance logs.
- `AnalyticsModule`: dashboards and account analytics endpoints.
- `SearchModule`: cross-entity keyword search.
- `ImportExportModule`: CSV import/export for trades and journals.
- `EconomicCalendarModule`: calendar event fetch + trade context event attachment.
- `SettingsModule`: singleton app-level settings record.
- `HealthModule`: public health endpoint.

## Request Lifecycle
Typical request flow:
1. Fastify receives request under `/api/v1`.
2. Global guards execute:
   - `JwtAuthGuard` enforces bearer auth unless `@Public()`.
   - `RolesGuard` enforces `@Roles(...)` constraints.
3. Validation:
   - Global Nest `ValidationPipe`.
   - Feature-level `ZodValidationPipe` for schemas in many controllers.
4. Controller delegates to service (business logic).
5. Service executes Drizzle queries and optional storage operations.
6. `ApiResponseInterceptor` wraps successful responses as `{ data: ... }` unless already shaped or CSV.
7. `AllExceptionsFilter` normalizes errors to `{ error, meta }`.

## Authentication and Authorization
- Default posture: all routes require JWT unless marked `@Public`.
- JWT strategy validates token and loads active user from DB.
- Local auth uses email/password (`passport-local` + bcrypt verify).
- Google auth uses `passport-google-oauth20` and upserts users by `google_id`/email.
- RBAC roles (`ADMIN`, `USER`) are stored in `roles` + `user_roles`.
- Admin routes are namespaced under `admin/users` and protected by `@Roles('ADMIN')`.

## Data Architecture
PostgreSQL schema is defined in `src/db/schema/*.ts`, with migrations in `drizzle/`.

Core entity groups:
- Identity: `users`, `roles`, `user_roles`.
- Trading setup: `account_groups`, `accounts`, `instruments`, `strategies`, `strategy_steps`, `strategy_confluences`.
- Trading execution: `trades`, `trade_tags`, `trade_tag_pivot`, `trade_demon_pivot`, `trade_market_condition*_pivot`, `trade_attachments`, `trade_confluence_checks`, `trade_context_events`.
- Journaling: `daily_journals`, `daily_journal_trades`, `daily_journal_demons`, `daily_journal_attachments`.
- Behavioral tracking: `demons`, `demon_evidence_logs`, `demon_performance_logs`.
- App config: `app_settings`.

Modeling patterns:
- UUID primary keys across entities.
- Soft delete via `deleted_at` on selected tables (`accounts`, `trades`, `daily_journals`).
- Numeric financial/ratio values stored in Postgres numeric columns; services convert to/from strings as needed.

## Transaction and Consistency Boundaries
Transaction support is provided by `@nestjs-cls/transactional` + Drizzle adapter.

Explicit transactional operations:
- `TradesService.create` and `TradesService.update`
- `JournalsService.create` and `JournalsService.update`

These operations atomically combine base record writes with relation synchronization (tags, demons, confluence checks, journal links).

## File and CSV Processing
Uploads:
- Handled via Fastify multipart.
- Size limit enforced by `MAX_UPLOAD_BYTES`.
- Stored by `LocalStorageService` under `UPLOAD_DIR`.

Attachment domains:
- Trade attachments (`trade_attachments` + filesystem).
- Journal attachments (`daily_journal_attachments` + filesystem).

CSV:
- Import endpoint parses and validates row-by-row trade CSV.
- Export endpoints stream CSV for trades and journals.

## External Integration Points
- Google OAuth provider for authentication.
- Economic calendar provider abstraction:
  - Token: `ECONOMIC_CALENDAR_PROVIDER`
  - Current implementation: `StubEconomicCalendarProvider`
  - Service-level in-memory cache (1 hour TTL, bounded size).

## Configuration Model
Environment variables are parsed and validated by Zod (`env.schema.ts`) at startup. Key settings include:
- `DB_URL`
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- Google OAuth credentials and callback URL
- `UPLOAD_DIR`, `MAX_UPLOAD_BYTES`
- login lockout settings
- default admin seed credentials

## Architectural Style Summary
This codebase follows a pragmatic modular-monolith architecture:
- Clear feature module boundaries.
- Thin controllers, service-centered business logic.
- Centralized auth/error/response behavior.
- Transaction-aware DB operations where write consistency matters.
- Extension points already present for external providers and storage backends.
