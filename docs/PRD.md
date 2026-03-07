# CryJournal Product Requirements Document (PRD)

## Document Control
- Product: CryJournal
- Document: PRD
- Version: 1.0
- Date: March 8, 2026
- Status: Draft
- Scope: Backend API product requirements for the current NestJS project

## 1. Product Summary
CryJournal is a trading journal platform API for capturing trades, reviewing execution quality, tracking behavioral patterns, and generating analytics for performance improvement.

The product supports:
- Multi-account trading logs.
- Structured strategy and confluence tracking.
- Daily journaling tied to trades and behavioral events.
- Performance analytics across time, accounts, sessions, and instruments.
- CSV import/export workflows.
- Role-based access for end users and administrators.

## 2. Problem Statement
Active traders often track decisions, execution, and psychology in disconnected tools. This causes:
- Incomplete trade context.
- Weak feedback loops for improving decision quality.
- Limited visibility into recurring behavioral mistakes.
- Manual, error-prone reporting.

CryJournal solves this with a single source of truth for execution data, journal notes, and behavioral signals.

## 3. Goals and Non-Goals

### Goals
- Provide reliable APIs for complete trade and journal capture.
- Connect strategy confluences and behavioral demons to measurable outcomes.
- Enable fast, filterable analytics to guide improvement.
- Support secure authentication with role-based authorization.
- Allow ingestion/export of trading data via CSV.

### Non-Goals (Current Scope)
- Real-time exchange connectivity or order execution.
- Portfolio management and live PnL streaming.
- Frontend/UI requirements.
- Billing, subscriptions, or tenant isolation.

## 4. Target Users
- Trader (USER):
  - Logs trades and journals.
  - Tracks strategy adherence and emotional/behavioral patterns.
  - Reviews analytics and history.
- Admin (ADMIN):
  - Manages users, roles, and active status.
  - Oversees system operations and access policies.

## 5. Core User Journeys
1. Onboarding and Access
   - User registers or signs in (local/Google).
   - User receives JWT and accesses protected endpoints.
2. Trading Setup
   - User creates account groups/accounts, instruments, and strategies.
3. Trade Capture
   - User records executed/missed trades with optional tags, demons, and confluence checks.
   - System computes metrics (PnL, R-multiple, win/loss, holding profile, decision quality score).
4. Reflection and Journaling
   - User creates daily journal entries and links trades/demons.
   - User uploads evidence/attachments for trades and journals.
5. Review and Improvement
   - User uses analytics and search to find patterns.
   - User exports/imports data for external workflows.

## 6. Functional Requirements

### 6.1 Authentication and Authorization
- FR-001: System shall support local registration and login with email/password.
- FR-002: System shall support Google OAuth login.
- FR-003: System shall issue JWT bearer tokens for authenticated sessions.
- FR-004: System shall enforce authentication by default for all API routes.
- FR-005: System shall support public routes for health and auth entry points.
- FR-006: System shall enforce role checks on admin-only endpoints.

### 6.2 User and Role Management
- FR-010: Admin shall list users with pagination.
- FR-011: Admin shall assign one or more roles to a user.
- FR-012: Admin shall activate/deactivate users.
- FR-013: System shall keep role definitions (`ADMIN`, `USER`) available in storage.

### 6.3 Trading Setup Domain
- FR-020: Users shall manage account groups.
- FR-021: Users shall create/update accounts and archive/restore accounts.
- FR-022: Users shall manage instruments; symbol uniqueness shall be enforced.
- FR-023: Users shall manage strategies with steps and confluences.
- FR-024: Strategy deletion shall be blocked if linked trades exist.
- FR-025: Users shall read/update global app settings.

### 6.4 Trade Lifecycle
- FR-030: Users shall create and update trades with required and optional metadata.
- FR-031: System shall support trade types `executed` and `missed`.
- FR-032: System shall calculate and persist derived metrics:
  - pnl
  - r_multiple
  - win_loss_flag
  - holding_time_seconds
  - holding_bucket
  - decision_quality_score (when confluence checks exist)
- FR-033: System shall support trade list filters:
  - account, instrument, strategy, type, date range, session, tags, demons.
- FR-034: System shall support bulk trade updates (strategy/tags).
- FR-035: Users shall upload and delete trade attachments.
- FR-036: System shall validate crypto-only fields against account type constraints.

### 6.5 Journaling Domain
- FR-040: Users shall create, update, list, and retrieve daily journals.
- FR-041: Journal records shall support links to trades and demons.
- FR-042: Users shall upload and delete journal attachments.
- FR-043: Journals shall support date/account filtering and pagination.

### 6.6 Behavioral Domain
- FR-050: Users shall create and manage demons (behavioral patterns).
- FR-051: Users shall log demon evidence linked to trades/journals.
- FR-052: Users shall retrieve demon performance logs.

### 6.7 Analytics and Search
- FR-060: System shall provide home analytics summary over date range.
- FR-061: System shall provide account-level analytics:
  - overview
  - instrument breakdown
  - session breakdown
  - entry-time heatmap
  - monthly pnl calendar
  - recent trades
- FR-062: System shall provide strategy analytics endpoint.
- FR-063: System shall provide multi-entity search across instruments, tags, strategies, demons, and trade notes.

### 6.8 Import/Export and Context Enrichment
- FR-070: System shall import trades from CSV with row-level validation and error reporting.
- FR-071: System shall export trades and journals as CSV.
- FR-072: System shall expose economic calendar events endpoint.
- FR-073: System shall allow attaching context events to trades.

### 6.9 Platform and Operational
- FR-080: System shall expose a health check endpoint.
- FR-081: System shall expose Swagger documentation.
- FR-082: System shall standardize success and error payload structure.

## 7. Non-Functional Requirements

### Security
- NFR-001: JWT validation must be enforced on protected routes.
- NFR-002: Passwords must be stored as secure hashes.
- NFR-003: Request payload validation must reject malformed input.
- NFR-004: File upload size limits must be configurable and enforced.

### Reliability and Data Integrity
- NFR-010: Trade and journal multi-step writes must be transaction-safe.
- NFR-011: Referential integrity must be enforced through DB constraints.
- NFR-012: Soft-delete behavior must preserve historical records where required.

### Performance
- NFR-020: List endpoints must support pagination.
- NFR-021: Search endpoint should return results quickly for short queries.
- NFR-022: Analytics queries should complete within acceptable dashboard latency for typical dataset sizes.

### Observability and Operability
- NFR-030: Structured logging should be available for runtime diagnostics.
- NFR-031: Error responses must include machine-readable code and request metadata.
- NFR-032: Environment configuration must fail fast on invalid values.

## 8. API and Data Contract Requirements
- Base API path: `/api/v1`.
- OpenAPI docs path: `/docs`.
- Standard success envelope: `{ data: ... }` (except raw CSV responses).
- Standard error envelope: `{ error: { code, message, details }, meta: { path, method } }`.

Key persistence requirements:
- PostgreSQL via Drizzle ORM.
- Migrations tracked in `drizzle/`.
- Core entities include users, roles, accounts, instruments, strategies, trades, journals, demons, settings.

## 9. Success Metrics (KPIs)
- Product Adoption:
  - Daily active users logging at least one trade or journal entry.
- Data Completeness:
  - Percentage of trades with stop loss and dollar risk populated.
- Behavioral Insight Quality:
  - Percentage of trades linked to strategy confluence checks.
  - Percentage of journal entries linked to trades or demons.
- Retention:
  - Weekly returning users.
- Operational Health:
  - API error rate by endpoint.
  - Median and p95 latency for analytics and list endpoints.

## 10. Release Scope and Phasing

### Phase 1 (Implemented Baseline)
- Auth/RBAC
- User admin
- Accounts, instruments, strategies
- Trades, journals, demons
- Analytics/search
- CSV import/export
- Economic calendar stub integration
- File attachments

### Phase 2 (Recommended Next)
- Refresh token and session lifecycle hardening.
- Rate limiting and abuse controls.
- Replace economic calendar stub with real provider integration.
- Additional analytics (risk-adjusted metrics, longitudinal behavior scoring).
- Audit trail for admin/security-sensitive actions.

## 11. Dependencies
- PostgreSQL availability and schema migration discipline.
- Valid environment configuration for auth/storage/OAuth.
- External OAuth provider setup (Google credentials and callback URL).

## 12. Risks and Mitigations
- Risk: Large analytics queries degrade with growth.
  - Mitigation: Add targeted indexes/materialized aggregates for heavy queries.
- Risk: Attachment storage growth on local disk.
  - Mitigation: Add retention policy and pluggable object storage backend.
- Risk: CSV import quality issues from inconsistent source data.
  - Mitigation: Keep strict row validation and expose precise row-level errors.
- Risk: Unauthorized access due to misconfigured public routes.
  - Mitigation: Maintain secure-by-default guard posture and route audits.

## 13. Out of Scope
- Native mobile client requirements.
- Multi-tenant isolation by organization/workspace.
- Trade execution automation or broker connectivity.
- Notification and messaging systems.

## 14. Acceptance Criteria
- All functional requirements in Sections 6.1 to 6.9 are testable through API endpoints.
- Auth and RBAC protections are enforced for protected/admin routes.
- Trade and journal write flows maintain relational consistency under failure conditions.
- CSV import/export workflows operate for expected formats.
- Health and documentation endpoints are available in non-production environments.
