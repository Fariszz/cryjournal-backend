# Codex Rules — TypeScript (Strict Engineering Standard)

## Prime Directive
Write clean, maintainable, strictly typed TypeScript. 
No shortcuts. No weakening the type system.

---

## 1. TypeScript Configuration (Mandatory)

- `strict: true`
- Enable:
  - `noImplicitAny`
  - `strictNullChecks`
  - `strictFunctionTypes`
  - `strictBindCallApply`
  - `strictPropertyInitialization`
  - `noImplicitThis`
  - `alwaysStrict`
  - `exactOptionalPropertyTypes`
- Build must fail on type errors (`noEmitOnError` or equivalent).

Never weaken TypeScript strictness to “make it work.”

---

## 2. Type Safety Rules

### 🚫 Forbidden
- `any`
- Unexplained `// @ts-ignore`
- Unexplained `// @ts-expect-error`
- `enum`

If suppression is absolutely necessary, it must include:
- Why it is safe
- When it can be removed

### ✅ Required
- Explicit parameter types
- Explicit return types for exported functions
- Clear object typing
- Use `unknown` instead of `any`
- Narrow properly before usage

---

## 3. Prefer Modern Type Patterns

- Use **string unions** instead of enums
- Use `as const` for literal types
- Prefer discriminated unions
- Use exhaustiveness checking in switch statements
- Use utility types:
  - `Partial`
  - `Required`
  - `Pick`
  - `Omit`
  - `Record`
- Use generics with constraints
- Prefer `readonly` where applicable
- Avoid unsafe type assertions

---

## 4. Runtime Validation (Zod Required at Boundaries)

All external data must be validated:

- API responses
- Request payloads
- Environment variables
- File inputs
- User input

### Rules:
- Use Zod (`z`)
- Use `parse()` for strict validation
- Use `safeParse()` when controlled failure is required
- No `as` casting for external data
- Use `.refine()` or `.superRefine()` for custom rules
- Use `.transform()` where needed
- Always handle validation errors explicitly

---

## 5. Code Style & ESLint Behavior Rules

### General
- Prefer `const` over `let`
- Never return `await`
- Always use curly braces
- Use template literals instead of string concatenation
- Use object spread instead of `Object.assign`
- Use rest parameters instead of `arguments`
- Use optional chaining (`?.`)
- Use nullish coalescing (`??`)
- Prefix unused variables with `_`

### Imports
Order imports as:

1. Built-in
2. External
3. Internal (alias)
4. Parent
5. Sibling
6. Index
7. Type imports

Rules:
- Group imports with blank lines
- Sort alphabetically inside groups
- Sort named imports
- No duplicate imports
- No circular dependencies

## Code Organization
- Document complex types with JSDoc comments

---