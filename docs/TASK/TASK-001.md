
# CryJournal Backend Refactor Tasks
## Scope
Refactor **Users**, **Auth**, and **RBAC** modules according to the PRD requirements.

Main objectives:
- Replace `class-validator` with **Zod** for request validation.
- Move authentication guards to **common/auth**.
- Move RBAC guards to **common**.
- Standardize module boundaries and responsibilities.

---

# 1. RBAC Refactor

## Goal
Ensure RBAC logic is centralized and reusable across the system.

## Tasks

### RBAC Guards
- Move RBAC guards to:

```
src/common/guards/
```

Files to implement:

```
src/common/guards/roles.guard.ts
src/common/decorators/roles.decorator.ts
```

### Roles Guard Requirements
- Read required roles from metadata.
- Compare user roles from JWT payload.
- Return `ForbiddenException` when roles do not match.

Example logic:

- Extract roles via `Reflector`
- Compare with `request.user.roles`

### Roles Decorator

Example:

```
@Roles('ADMIN')
```

Must attach metadata via `SetMetadata`.

---

# 2. Auth Module Refactor

## Goal
Standardize authentication and move guards to shared common modules.

## Directory Structure

```
src/modules/auth
src/common/auth
```

### Move Guards

Move the following to:

```
src/common/auth/
```

Required files:

```
jwt-auth.guard.ts
optional-auth.guard.ts
jwt.strategy.ts
auth.decorator.ts
```

### Tasks

- Refactor `JwtAuthGuard` to reside under `common/auth`
- Ensure guard is reusable across modules
- Ensure guard reads JWT from Bearer token
- Ensure request user is attached to `request.user`

### Validation Refactor

Remove `class-validator` DTO validation.

Replace with **Zod validation schemas**.

Example structure:

```
src/modules/auth/schemas/
    login.schema.ts
    register.schema.ts
```

Example:

```ts
import { z } from "zod"

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})
```

### Controller Validation

Use Zod parsing inside controller or pipe.

Example:

```ts
const body = LoginSchema.parse(req.body)
```

---

# 3. Users Module Refactor

## Goal
Replace validation with Zod and simplify DTO usage.

### Remove
- `class-validator`
- `class-transformer`

### Replace With
Zod schemas.

Directory structure:

```
src/modules/users/schemas/
    create-user.schema.ts
    update-user.schema.ts
```

Example:

```ts
import { z } from "zod"

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6)
})
```

### Controller Changes

Instead of DTOs:

```
@Post()
create(@Body() dto: CreateUserDto)
```

Use:

```
@Post()
create(@Body() body: unknown) {
  const data = CreateUserSchema.parse(body)
}
```

---

# 4. Folder Structure After Refactor

Expected structure:

```
src
 ├─ common
 │   ├─ auth
 │   │   ├─ jwt-auth.guard.ts
 │   │   ├─ optional-auth.guard.ts
 │   │   ├─ jwt.strategy.ts
 │   │   └─ auth.decorator.ts
 │   │
 │   ├─ guards
 │   │   └─ roles.guard.ts
 │   │
 │   └─ decorators
 │       └─ roles.decorator.ts
 │
 ├─ modules
 │   ├─ auth
 │   │   ├─ auth.controller.ts
 │   │   ├─ auth.service.ts
 │   │   └─ schemas
 │   │        ├─ login.schema.ts
 │   │        └─ register.schema.ts
 │   │
 │   ├─ users
 │   │   ├─ users.controller.ts
 │   │   ├─ users.service.ts
 │   │   └─ schemas
 │   │        ├─ create-user.schema.ts
 │   │        └─ update-user.schema.ts
 │   │
 │   └─ rbac
 │        ├─ roles.service.ts
 │        └─ roles.module.ts
```

---

# 5. Remove Legacy Dependencies

Remove from project:

```
class-validator
class-transformer
```

Update validation strategy fully to **Zod**.

---

# 6. Testing Tasks

## Auth

Test:

- Register
- Login
- Invalid credentials
- JWT protected route

## RBAC

Test:

- USER accessing USER route
- USER accessing ADMIN route → must fail
- ADMIN accessing ADMIN route → success

## Users

Test:

- Create user validation errors
- Update user validation errors
- Role assignment

---

# 7. Acceptance Criteria

The refactor is considered complete when:

- No module uses `class-validator`
- All validation uses **Zod**
- Auth guards live in `common/auth`
- RBAC guard lives in `common/guards`
- Roles decorator is reusable
- Protected endpoints correctly enforce JWT and roles
- All auth flows work with the new validation layer

---

# 8. Optional Improvements (Recommended)

- Create reusable **ZodValidationPipe**
- Add **request logging middleware**
- Add **rate limiting guard**
- Add **refresh token support**
