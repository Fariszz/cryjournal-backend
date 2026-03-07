# Repository Guidelines

## Project Structure & Module Organization
`src/` contains application code:
- `src/modules/` feature modules (`accounts`, `journals`, `trades`, etc.) with files like `*.module.ts`, `*.controller.ts`, `*.service.ts`, and `*.schemas.ts`.
- `src/common/` shared cross-cutting concerns (auth, config, logging, validation, storage, HTTP filters/interceptors).
- `src/db/` database provider and schema definitions.
- `src/main.ts` bootstraps Fastify + Swagger (`/docs`), and `src/app.module.ts` wires modules.

`test/` holds e2e tests (`*.e2e-spec.ts`).  
`drizzle/` stores SQL migrations and seed metadata.  
`dist/` is build output and should not be edited directly.

## Build, Test, and Development Commands
- `pnpm install` install dependencies.
- `pnpm run start:dev` run Nest in watch mode with SWC.
- `pnpm run build` compile to `dist/`.
- `pnpm run start:prod` run compiled app from `dist/main`.
- `pnpm run lint` run ESLint and auto-fix issues.
- `pnpm run format` format `src/**/*.ts` and `test/**/*.ts` with Prettier.
- `pnpm run test`, `pnpm run test:watch`, `pnpm run test:cov`, `pnpm run test:e2e` run Jest suites.
- `pnpm run db:generate|db:migrate|db:push|db:studio` manage Drizzle migrations.
- `pnpm run seed` seed database data.

## Coding Style & Naming Conventions
Use TypeScript with strict compiler settings (`strict`, `noImplicitAny`, `exactOptionalPropertyTypes`).  
Formatting is Prettier-based (`singleQuote: true`, `trailingComma: all`), with ESLint (`typescript-eslint` + Prettier plugin) enforcing consistency.

Follow existing naming:
- File/folder names: kebab-case (`economic-calendar`, `import-export`).
- Classes/types: PascalCase.
- Constants/tokens: UPPER_SNAKE_CASE (for provider tokens).

Prefer path aliases: `@db/*`, `@modules/*`, `@common/*`.

## Testing Guidelines
Unit tests use Jest pattern `*.spec.ts` under `src/`.  
E2E tests live in `test/` using `*.e2e-spec.ts` and `test/jest-e2e.json`.

Add or update tests for behavior changes, especially for controllers/services and DB-integrated flows. Use `pnpm run test:cov` before opening a PR.

## Commit & Pull Request Guidelines
Recent history follows Conventional Commits:
- `feat: ...`
- `fix: ...`
- `refactor(scope): ...`

Keep commits focused and imperative.  
PRs should include:
- concise problem/solution summary,
- linked issue (if applicable),
- notes on migration/config changes (e.g., new `drizzle/*.sql`),
- test evidence (`pnpm run lint`, relevant Jest commands).

## Security & Configuration Tips
Copy `.env.example` for local setup and keep secrets out of git.  
Required runtime values include `DB_URL`, JWT secrets, and upload/login limits.  
When schema changes, commit both schema updates and generated migration files together.
