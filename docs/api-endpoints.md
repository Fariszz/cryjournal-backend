# API Endpoint Catalog

Generated at: 2026-03-08T10:05:11.481Z
Global prefix: `/api/v1`
Total endpoints: **62**

Auth rule: routes are treated as protected by default because `JwtAuthGuard` is registered globally; `@Public()` marks public routes.

## GET /api/v1/account-groups

Controller: `AccountsController`
Handler: `listGroups`
Auth: Required
Roles: -
Guards: -

Request

```json
{}
```

Response

Type: `{ id: string; name: string; description: string | null; createdAt: Date; updatedAt: Date; }[]`
Service source: `accountsService.listGroups()`

```json
[
  {
    "id": "string",
    "name": "string",
    "description": ["null", "string"],
    "createdAt": "Date",
    "updatedAt": "Date"
  }
]
```

## POST /api/v1/account-groups

Controller: `AccountsController`
Handler: `createGroup`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "body": {
    "typeName": "AccountGroupCreateDto",
    "shape": {
      "name": "string",
      "description?": ["undefined", "string"]
    }
  }
}
```

Response

Type: `{ id: string; name: string; description: string | null; createdAt: Date; updatedAt: Date; }`
Service source: `accountsService.createGroup()`

```json
{
  "id": "string",
  "name": "string",
  "description": ["null", "string"],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## PUT /api/v1/account-groups/:id

Controller: `AccountsController`
Handler: `updateGroup`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "params": {
    "typeName": "AccountGroupIdParamDto",
    "shape": {
      "id": "string"
    }
  },
  "body": {
    "typeName": "AccountGroupUpdateDto",
    "shape": {
      "name?": ["undefined", "string"],
      "description?": ["undefined", "string"]
    }
  }
}
```

Response

Type: `{ id: string; name: string; description: string | null; createdAt: Date; updatedAt: Date; }`
Service source: `accountsService.updateGroup()`

```json
{
  "id": "string",
  "name": "string",
  "description": ["null", "string"],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## GET /api/v1/accounts

Controller: `AccountsController`
Handler: `listAccounts`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "query": {
    "typeName": "AccountListQueryDto",
    "shape": {
      "group_id?": ["undefined", "string"],
      "archived?": ["undefined", "true", "false"]
    }
  }
}
```

Response

Type: `AccountResponse[]`
Service source: `accountsService.listAccounts()`

```json
[
  {
    "id": "string",
    "name": "string",
    "createdAt": "Date",
    "updatedAt": "Date",
    "groupId": ["null", "string"],
    "broker": "string",
    "accountType": ["crypto", "forex", "stocks"],
    "baseCurrency": "string",
    "timezone": "string",
    "startingBalance": ["null", "string"],
    "deletedAt": ["null", "Date"]
  }
]
```

## POST /api/v1/accounts

Controller: `AccountsController`
Handler: `createAccount`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "body": {
    "typeName": "AccountCreateDto",
    "shape": {
      "name": "string",
      "broker": "string",
      "accountType": ["crypto", "forex", "stocks"],
      "baseCurrency": "string",
      "timezone": "string",
      "groupId?": ["undefined", "null", "string"],
      "startingBalance?": ["undefined", "number"]
    }
  }
}
```

Response

Type: `{ id: string; name: string; createdAt: Date; updatedAt: Date; groupId: string | null; broker: string; accountType: "crypto" | "forex" | "stocks"; baseCurrency: string; timezone: string; startingBalance: string | null; deletedAt: Date | null; }`
Service source: `accountsService.createAccount()`

```json
{
  "id": "string",
  "name": "string",
  "createdAt": "Date",
  "updatedAt": "Date",
  "groupId": ["null", "string"],
  "broker": "string",
  "accountType": ["crypto", "forex", "stocks"],
  "baseCurrency": "string",
  "timezone": "string",
  "startingBalance": ["null", "string"],
  "deletedAt": ["null", "Date"]
}
```

## PUT /api/v1/accounts/:id

Controller: `AccountsController`
Handler: `updateAccount`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "params": {
    "typeName": "AccountIdParamDto",
    "shape": {
      "id": "string"
    }
  },
  "body": {
    "typeName": "AccountUpdateDto",
    "shape": {
      "groupId?": ["undefined", "null", "string"],
      "name?": ["undefined", "string"],
      "broker?": ["undefined", "string"],
      "accountType?": ["undefined", "crypto", "forex", "stocks"],
      "baseCurrency?": ["undefined", "string"],
      "timezone?": ["undefined", "string"],
      "startingBalance?": ["undefined", "number"]
    }
  }
}
```

Response

Type: `{ id: string; groupId: string | null; name: string; broker: string; accountType: "crypto" | "forex" | "stocks"; baseCurrency: string; timezone: string; startingBalance: string | null; deletedAt: Date | null; createdAt: Date; updatedAt: Date; }`
Service source: `accountsService.updateAccount()`

```json
{
  "id": "string",
  "groupId": ["null", "string"],
  "name": "string",
  "broker": "string",
  "accountType": ["crypto", "forex", "stocks"],
  "baseCurrency": "string",
  "timezone": "string",
  "startingBalance": ["null", "string"],
  "deletedAt": ["null", "Date"],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## POST /api/v1/accounts/:id/archive

Controller: `AccountsController`
Handler: `archiveAccount`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "params": {
    "typeName": "AccountIdParamDto",
    "shape": {
      "id": "string"
    }
  }
}
```

Response

Type: `{ id: string; groupId: string | null; name: string; broker: string; accountType: "crypto" | "forex" | "stocks"; baseCurrency: string; timezone: string; startingBalance: string | null; deletedAt: Date | null; createdAt: Date; updatedAt: Date; }`
Service source: `accountsService.archiveAccount()`

```json
{
  "id": "string",
  "groupId": ["null", "string"],
  "name": "string",
  "broker": "string",
  "accountType": ["crypto", "forex", "stocks"],
  "baseCurrency": "string",
  "timezone": "string",
  "startingBalance": ["null", "string"],
  "deletedAt": ["null", "Date"],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## POST /api/v1/accounts/:id/restore

Controller: `AccountsController`
Handler: `restoreAccount`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "params": {
    "typeName": "AccountIdParamDto",
    "shape": {
      "id": "string"
    }
  }
}
```

Response

Type: `{ id: string; groupId: string | null; name: string; broker: string; accountType: "crypto" | "forex" | "stocks"; baseCurrency: string; timezone: string; startingBalance: string | null; deletedAt: Date | null; createdAt: Date; updatedAt: Date; }`
Service source: `accountsService.restoreAccount()`

```json
{
  "id": "string",
  "groupId": ["null", "string"],
  "name": "string",
  "broker": "string",
  "accountType": ["crypto", "forex", "stocks"],
  "baseCurrency": "string",
  "timezone": "string",
  "startingBalance": ["null", "string"],
  "deletedAt": ["null", "Date"],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## GET /api/v1/admin/users

Controller: `AdminUsersController`
Handler: `list`
Auth: Required
Roles: ADMIN
Guards: -

Request

```json
{
  "query": {
    "typeName": "{ page: number; limit: number; }",
    "shape": {
      "page": "number",
      "limit": "number"
    }
  }
}
```

Response

Type: `UsersPaginationResult`
Service source: `usersService.listUsers()`

```json
{
  "items": [
    {
      "id": "string",
      "email": "string",
      "name": "string",
      "googleId": ["null", "string"],
      "isActive": "boolean",
      "roles": [["\"ADMIN\"", "\"USER\""]],
      "createdAt": "Date",
      "updatedAt": "Date"
    }
  ],
  "page": "number",
  "limit": "number",
  "total": "number",
  "totalPages": "number"
}
```

## PATCH /api/v1/admin/users/:id/activate

Controller: `AdminUsersController`
Handler: `updateActiveState`
Auth: Required
Roles: ADMIN
Guards: -

Request

```json
{
  "params": {
    "typeName": "string",
    "shape": {
      "id": "string"
    }
  },
  "body": {
    "typeName": "{ isActive: boolean; }",
    "shape": {
      "isActive": "boolean"
    }
  }
}
```

Response

Type: `UserProfile`
Service source: `usersService.setActive()`

```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "googleId": ["null", "string"],
  "isActive": "boolean",
  "roles": [["ADMIN", "USER"]],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## PATCH /api/v1/admin/users/:id/roles

Controller: `AdminUsersController`
Handler: `assignRoles`
Auth: Required
Roles: ADMIN
Guards: -

Request

```json
{
  "params": {
    "typeName": "string",
    "shape": {
      "id": "string"
    }
  },
  "body": {
    "typeName": "{ roles: (\"ADMIN\" | \"USER\")[]; }",
    "shape": {
      "roles": [["ADMIN", "USER"]]
    }
  }
}
```

Response

Type: `UserProfile`
Service source: `usersService.assignRoles()`

```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "googleId": ["null", "string"],
  "isActive": "boolean",
  "roles": [["ADMIN", "USER"]],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## GET /api/v1/analytics/accounts/:id/entry-time-heatmap

Controller: `AnalyticsController`
Handler: `heatmap`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "params": {
    "typeName": "AccountIdParamDto",
    "shape": {
      "id": "string"
    }
  },
  "query": {
    "typeName": "AccountOverviewQueryDto",
    "shape": {
      "date_from": "string",
      "date_to": "string"
    }
  }
}
```

Response

Type: `AnalyticsAccountEntryTimeHeatmapResponse[]`
Service source: `analyticsService.accountEntryTimeHeatmap()`

```json
[
  {
    "hour": "number",
    "trades": "number",
    "net_pnl": "number"
  }
]
```

## GET /api/v1/analytics/accounts/:id/instruments

Controller: `AnalyticsController`
Handler: `instruments`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "params": {
    "typeName": "AccountIdParamDto",
    "shape": {
      "id": "string"
    }
  },
  "query": {
    "typeName": "AccountInstrumentsQueryDto",
    "shape": {
      "date_from": "string",
      "date_to": "string",
      "page": "number",
      "page_size": "number"
    }
  }
}
```

Response

Type: `AnalyticsAccountInstrumentsResponse`
Service source: `analyticsService.accountInstruments()`

```json
{
  "rows": [
    {
      "instrument_id": ["null", "string"],
      "symbol": "string",
      "trades": "number",
      "win_rate": "number",
      "expectancy": "number",
      "profit_factor": "number",
      "avg_r": "number",
      "max_drawdown": "number",
      "tp_capture_ratio": "number",
      "net_pnl": "number"
    }
  ],
  "meta": {
    "page": "number",
    "page_size": "number",
    "total": "number"
  }
}
```

## GET /api/v1/analytics/accounts/:id/overview

Controller: `AnalyticsController`
Handler: `overview`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "params": {
    "typeName": "AccountIdParamDto",
    "shape": {
      "id": "string"
    }
  },
  "query": {
    "typeName": "AccountOverviewQueryDto",
    "shape": {
      "date_from": "string",
      "date_to": "string"
    }
  }
}
```

Response

Type: `AnalyticsAccountOverviewResponse`
Service source: `analyticsService.accountOverview()`

```json
{
  "account": {
    "id": "string",
    "name": "string",
    "account_type": "string",
    "base_currency": "string",
    "timezone": "string"
  },
  "kpis": {
    "trades_count": "number",
    "executed_count": "number",
    "missed_count": "number",
    "net_pnl": "number",
    "win_rate": "number",
    "avg_r": "number",
    "profit_factor": "number",
    "max_drawdown": "number"
  },
  "pnl_calendar": [
    {
      "date": "string",
      "pnl": "number",
      "trades": "number"
    }
  ]
}
```

## GET /api/v1/analytics/accounts/:id/pnl-calendar

Controller: `AnalyticsController`
Handler: `pnlCalendar`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "params": {
    "typeName": "AccountIdParamDto",
    "shape": {
      "id": "string"
    }
  },
  "query": {
    "typeName": "AccountMonthQueryDto",
    "shape": {
      "month?": ["undefined", "string"]
    }
  }
}
```

Response

Type: `AnalyticsAccountPnlCalendarResponse[]`
Service source: `analyticsService.accountPnlCalendar()`

```json
[
  {
    "date": "string",
    "pnl": "number",
    "trades": "number"
  }
]
```

## GET /api/v1/analytics/accounts/:id/sessions

Controller: `AnalyticsController`
Handler: `sessions`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "params": {
    "typeName": "AccountIdParamDto",
    "shape": {
      "id": "string"
    }
  },
  "query": {
    "typeName": "AccountOverviewQueryDto",
    "shape": {
      "date_from": "string",
      "date_to": "string"
    }
  }
}
```

Response

Type: `AnalyticsAccountSessionResponse[]`
Service source: `analyticsService.accountSessions()`

```json
[
  {
    "session": "string",
    "trades": "number",
    "net_pnl": "number",
    "win_rate": "number"
  }
]
```

## GET /api/v1/analytics/accounts/:id/trades/recent

Controller: `AnalyticsController`
Handler: `recent`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "params": {
    "typeName": "AccountIdParamDto",
    "shape": {
      "id": "string"
    }
  },
  "query": {
    "typeName": "AccountRecentTradesQueryDto",
    "shape": {
      "limit": "number"
    }
  }
}
```

Response

Type: `{ id: string; createdAt: Date; updatedAt: Date; type: "executed" | "missed"; timezone: string; deletedAt: Date | null; accountId: string; instrumentId: string; direction: "long" | "short"; ... 26 more ...; decisionQualityScore: string | null; }[]`
Service source: `analyticsService.accountRecentTrades()`

```json
[
  {
    "id": "string",
    "createdAt": "Date",
    "updatedAt": "Date",
    "type": ["executed", "missed"],
    "timezone": "string",
    "deletedAt": ["null", "Date"],
    "accountId": "string",
    "instrumentId": "string",
    "direction": ["long", "short"],
    "entryDatetime": "Date",
    "exitDatetime": ["null", "Date"],
    "entryTimeframe": ["null", "string"],
    "tradingSession": ["null", "string"],
    "entryPrice": ["null", "string"],
    "exitPrice": ["null", "string"],
    "stopLoss": ["null", "string"],
    "takeProfit": ["null", "string"],
    "dollarRisk": ["null", "string"],
    "positionSize": ["null", "string"],
    "positionSizeUnit": ["null", "lot", "usd", "contract"],
    "brokerCommission": ["null", "string"],
    "swap": ["null", "string"],
    "fundingFee": ["null", "string"],
    "positionType": ["null", "spot", "futures"],
    "leverage": ["null", "string"],
    "marginMode": ["null", "cross", "isolated"],
    "strategyId": ["null", "string"],
    "thesis": ["null", "string"],
    "postAnalysis": ["null", "string"],
    "notes": ["null", "string"],
    "pnl": ["null", "string"],
    "rMultiple": ["null", "string"],
    "winLossFlag": ["null", "win", "loss", "breakeven"],
    "holdingTimeSeconds": ["null", "number"],
    "holdingBucket": ["null", "scalp", "intraday", "swing", "position"],
    "decisionQualityScore": ["null", "string"]
  }
]
```

## GET /api/v1/analytics/home

Controller: `AnalyticsController`
Handler: `home`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "query": {
    "typeName": "HomeAnalyticsQueryDto",
    "shape": {
      "date_from": "string",
      "date_to": "string",
      "account_id?": ["undefined", "string"]
    }
  }
}
```

Response

Type: `AnalyticsHomeResponse`
Service source: `analyticsService.home()`

```json
{
  "summary": {
    "net_pnl": "number",
    "gross_profit": "number",
    "gross_loss": "number",
    "profit_factor": "number",
    "win_rate": "number",
    "avg_win": "number",
    "avg_loss": "number",
    "consistency_rating": "number",
    "max_drawdown": "number"
  },
  "equity_curve": [
    {
      "date": "string",
      "equity": "number",
      "pnl": "number"
    }
  ],
  "session_breakdown": [
    {
      "session": "string",
      "trades": "number",
      "net_pnl": "number",
      "win_rate": "number"
    }
  ],
  "recent_trades": [
    {
      "trade_id": "string",
      "symbol": "string",
      "pnl": "number",
      "entry_datetime": "Date"
    }
  ]
}
```

## GET /api/v1/auth/google

Controller: `AuthController`
Handler: `googleLogin`
Auth: Public
Roles: -
Guards: GoogleAuthGuard

Request

```json
{}
```

Response

Type: `void`

```json
null
```

## GET /api/v1/auth/google/callback

Controller: `AuthController`
Handler: `googleCallback`
Auth: Public
Roles: -
Guards: GoogleAuthGuard

Request

```json
{}
```

Response

Type: `AuthResponse`
Service source: `authService.login()`

```json
{
  "accessToken": "string",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "roles": [["ADMIN", "USER"]]
  }
}
```

## POST /api/v1/auth/login

Controller: `AuthController`
Handler: `login`
Auth: Public
Roles: -
Guards: LocalAuthGuard

Request

```json
{
  "body": {
    "typeName": "{ email: string; password: string; }",
    "shape": {
      "email": "string",
      "password": "string"
    }
  }
}
```

Response

Type: `AuthResponse`
Service source: `authService.login()`

```json
{
  "accessToken": "string",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "roles": [["ADMIN", "USER"]]
  }
}
```

## POST /api/v1/auth/logout

Controller: `AuthController`
Handler: `logout`
Auth: Required
Roles: -
Guards: -

Request

```json
{}
```

Response

Type: `{ data: { success: boolean; }; }`

```json
{
  "data": {
    "success": "boolean"
  }
}
```

## GET /api/v1/auth/me

Controller: `AuthController`
Handler: `me`
Auth: Required
Roles: -
Guards: -

Request

```json
{}
```

Response

Type: `{ id: string; email: string; name: string; roles: AppRole[]; }`
Service source: `authService.getMe()`

```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "roles": [["ADMIN", "USER"]]
}
```

## POST /api/v1/auth/register

Controller: `AuthController`
Handler: `register`
Auth: Public
Roles: -
Guards: -

Request

```json
{
  "body": {
    "typeName": "{ email: string; password: string; name: string; }",
    "shape": {
      "email": "string",
      "password": "string",
      "name": "string"
    }
  }
}
```

Response

Type: `AuthResponse`
Service source: `authService.register()`

```json
{
  "accessToken": "string",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "roles": [["ADMIN", "USER"]]
  }
}
```

## POST /api/v1/daily-journal-attachments

Controller: `JournalsController`
Handler: `uploadAttachment`
Auth: Required
Roles: -
Guards: -

Request

```json
{}
```

Response

Type: `{ id: string; createdAt: Date; updatedAt: Date; dailyJournalId: string; filePath: string; caption: string | null; }`
Service source: `journalsService.addAttachment()`

```json
{
  "id": "string",
  "createdAt": "Date",
  "updatedAt": "Date",
  "dailyJournalId": "string",
  "filePath": "string",
  "caption": ["null", "string"]
}
```

## DELETE /api/v1/daily-journal-attachments/:id

Controller: `JournalsController`
Handler: `deleteAttachment`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "params": {
    "typeName": "JournalAttachmentIdParamDto",
    "shape": {
      "id": "string"
    }
  }
}
```

Response

Type: `{ success: boolean; }`
Service source: `journalsService.deleteAttachment()`

```json
{
  "success": "boolean"
}
```

## GET /api/v1/daily-journals

Controller: `JournalsController`
Handler: `list`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "query": {
    "typeName": "JournalListQueryDto",
    "shape": {
      "page": "number",
      "page_size": "number",
      "date_from?": ["undefined", "string"],
      "date_to?": ["undefined", "string"],
      "account_id?": ["undefined", "string"]
    }
  }
}
```

Response

Type: `JournalsListResponse`
Service source: `journalsService.list()`

```json
{
  "rows": [
    {
      "date": "string",
      "id": "string",
      "createdAt": "Date",
      "updatedAt": "Date",
      "deletedAt": ["null", "Date"],
      "accountId": ["null", "string"],
      "mood": ["null", "number"],
      "energy": ["null", "number"],
      "focus": ["null", "number"],
      "confidence": ["null", "number"],
      "plan": ["null", "string"],
      "executionNotes": ["null", "string"],
      "lessons": ["null", "string"],
      "nextActions": ["null", "string"]
    }
  ],
  "meta": {
    "page": "number",
    "page_size": "number",
    "total": "number"
  }
}
```

## POST /api/v1/daily-journals

Controller: `JournalsController`
Handler: `create`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "body": {
    "typeName": "JournalCreateDto",
    "shape": {
      "date": "string",
      "accountId?": ["undefined", "string"],
      "mood?": ["undefined", "number"],
      "energy?": ["undefined", "number"],
      "focus?": ["undefined", "number"],
      "confidence?": ["undefined", "number"],
      "plan?": ["undefined", "string"],
      "executionNotes?": ["undefined", "string"],
      "lessons?": ["undefined", "string"],
      "nextActions?": ["undefined", "string"],
      "tradeIds?": ["undefined", ["string"]],
      "demonIds?": ["undefined", ["string"]]
    }
  }
}
```

Response

Type: `JournalDetailResponse`
Service source: `journalsService.create()`

```json
{
  "tradeIds": ["string"],
  "demonIds": ["string"],
  "attachments": [
    {
      "id": "string",
      "createdAt": "Date",
      "updatedAt": "Date",
      "dailyJournalId": "string",
      "filePath": "string",
      "caption": ["null", "string"]
    }
  ],
  "date": "string",
  "id": "string",
  "createdAt": "Date",
  "updatedAt": "Date",
  "deletedAt": ["null", "Date"],
  "accountId": ["null", "string"],
  "mood": ["null", "number"],
  "energy": ["null", "number"],
  "focus": ["null", "number"],
  "confidence": ["null", "number"],
  "plan": ["null", "string"],
  "executionNotes": ["null", "string"],
  "lessons": ["null", "string"],
  "nextActions": ["null", "string"]
}
```

## GET /api/v1/daily-journals/:id

Controller: `JournalsController`
Handler: `get`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "params": {
    "typeName": "JournalIdParamDto",
    "shape": {
      "id": "string"
    }
  }
}
```

Response

Type: `JournalDetailResponse`
Service source: `journalsService.getById()`

```json
{
  "tradeIds": ["string"],
  "demonIds": ["string"],
  "attachments": [
    {
      "id": "string",
      "createdAt": "Date",
      "updatedAt": "Date",
      "dailyJournalId": "string",
      "filePath": "string",
      "caption": ["null", "string"]
    }
  ],
  "date": "string",
  "id": "string",
  "createdAt": "Date",
  "updatedAt": "Date",
  "deletedAt": ["null", "Date"],
  "accountId": ["null", "string"],
  "mood": ["null", "number"],
  "energy": ["null", "number"],
  "focus": ["null", "number"],
  "confidence": ["null", "number"],
  "plan": ["null", "string"],
  "executionNotes": ["null", "string"],
  "lessons": ["null", "string"],
  "nextActions": ["null", "string"]
}
```

## PUT /api/v1/daily-journals/:id

Controller: `JournalsController`
Handler: `update`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "params": {
    "typeName": "JournalIdParamDto",
    "shape": {
      "id": "string"
    }
  },
  "body": {
    "typeName": "JournalUpdateDto",
    "shape": {
      "date?": ["undefined", "string"],
      "accountId?": ["undefined", "string"],
      "mood?": ["undefined", "number"],
      "energy?": ["undefined", "number"],
      "focus?": ["undefined", "number"],
      "confidence?": ["undefined", "number"],
      "plan?": ["undefined", "string"],
      "executionNotes?": ["undefined", "string"],
      "lessons?": ["undefined", "string"],
      "nextActions?": ["undefined", "string"],
      "tradeIds?": ["undefined", ["string"]],
      "demonIds?": ["undefined", ["string"]]
    }
  }
}
```

Response

Type: `JournalDetailResponse`
Service source: `journalsService.update()`

```json
{
  "tradeIds": ["string"],
  "demonIds": ["string"],
  "attachments": [
    {
      "id": "string",
      "createdAt": "Date",
      "updatedAt": "Date",
      "dailyJournalId": "string",
      "filePath": "string",
      "caption": ["null", "string"]
    }
  ],
  "date": "string",
  "id": "string",
  "createdAt": "Date",
  "updatedAt": "Date",
  "deletedAt": ["null", "Date"],
  "accountId": ["null", "string"],
  "mood": ["null", "number"],
  "energy": ["null", "number"],
  "focus": ["null", "number"],
  "confidence": ["null", "number"],
  "plan": ["null", "string"],
  "executionNotes": ["null", "string"],
  "lessons": ["null", "string"],
  "nextActions": ["null", "string"]
}
```

## GET /api/v1/demons

Controller: `DemonsController`
Handler: `list`
Auth: Required
Roles: -
Guards: -

Request

```json
{}
```

Response

Type: `{ id: string; name: string; createdAt: Date; updatedAt: Date; behavioralDensityScore: string | null; trigger: string | null; pattern: string | null; consequence: string | null; counterPlan: string | null; preventionChecklist: string[]; }[]`
Service source: `demonsService.list()`

```json
[
  {
    "id": "string",
    "name": "string",
    "createdAt": "Date",
    "updatedAt": "Date",
    "behavioralDensityScore": ["null", "string"],
    "trigger": ["null", "string"],
    "pattern": ["null", "string"],
    "consequence": ["null", "string"],
    "counterPlan": ["null", "string"],
    "preventionChecklist": ["string"]
  }
]
```

## POST /api/v1/demons

Controller: `DemonsController`
Handler: `create`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "body": {
    "typeName": "DemonCreateDto",
    "shape": {
      "name": "string",
      "preventionChecklist": ["string"],
      "trigger?": ["undefined", "string"],
      "pattern?": ["undefined", "string"],
      "consequence?": ["undefined", "string"],
      "counterPlan?": ["undefined", "string"]
    }
  }
}
```

Response

Type: `{ id: string; name: string; createdAt: Date; updatedAt: Date; behavioralDensityScore: string | null; trigger: string | null; pattern: string | null; consequence: string | null; counterPlan: string | null; preventionChecklist: string[]; }`
Service source: `demonsService.create()`

```json
{
  "id": "string",
  "name": "string",
  "createdAt": "Date",
  "updatedAt": "Date",
  "behavioralDensityScore": ["null", "string"],
  "trigger": ["null", "string"],
  "pattern": ["null", "string"],
  "consequence": ["null", "string"],
  "counterPlan": ["null", "string"],
  "preventionChecklist": ["string"]
}
```

## GET /api/v1/demons/:id

Controller: `DemonsController`
Handler: `get`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "params": {
    "typeName": "DemonIdParamDto",
    "shape": {
      "id": "string"
    }
  }
}
```

Response

Type: `{ id: string; name: string; createdAt: Date; updatedAt: Date; behavioralDensityScore: string | null; trigger: string | null; pattern: string | null; consequence: string | null; counterPlan: string | null; preventionChecklist: string[]; }`
Service source: `demonsService.getById()`

```json
{
  "id": "string",
  "name": "string",
  "createdAt": "Date",
  "updatedAt": "Date",
  "behavioralDensityScore": ["null", "string"],
  "trigger": ["null", "string"],
  "pattern": ["null", "string"],
  "consequence": ["null", "string"],
  "counterPlan": ["null", "string"],
  "preventionChecklist": ["string"]
}
```

## PUT /api/v1/demons/:id

Controller: `DemonsController`
Handler: `update`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "params": {
    "typeName": "DemonIdParamDto",
    "shape": {
      "id": "string"
    }
  },
  "body": {
    "typeName": "DemonUpdateDto",
    "shape": {
      "name?": ["undefined", "string"],
      "trigger?": ["undefined", "string"],
      "pattern?": ["undefined", "string"],
      "consequence?": ["undefined", "string"],
      "counterPlan?": ["undefined", "string"],
      "preventionChecklist?": ["undefined", ["string"]]
    }
  }
}
```

Response

Type: `{ id: string; name: string; behavioralDensityScore: string | null; trigger: string | null; pattern: string | null; consequence: string | null; counterPlan: string | null; preventionChecklist: string[]; createdAt: Date; updatedAt: Date; }`
Service source: `demonsService.update()`

```json
{
  "id": "string",
  "name": "string",
  "behavioralDensityScore": ["null", "string"],
  "trigger": ["null", "string"],
  "pattern": ["null", "string"],
  "consequence": ["null", "string"],
  "counterPlan": ["null", "string"],
  "preventionChecklist": ["string"],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## GET /api/v1/demons/:id/evidence

Controller: `DemonsController`
Handler: `listEvidence`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "params": {
    "typeName": "DemonIdParamDto",
    "shape": {
      "id": "string"
    }
  }
}
```

Response

Type: `{ id: string; createdAt: Date; updatedAt: Date; demonId: string; tradeId: string | null; dailyJournalId: string | null; note: string | null; screenshotPath: string | null; }[]`
Service source: `demonsService.listEvidence()`

```json
[
  {
    "id": "string",
    "createdAt": "Date",
    "updatedAt": "Date",
    "demonId": "string",
    "tradeId": ["null", "string"],
    "dailyJournalId": ["null", "string"],
    "note": ["null", "string"],
    "screenshotPath": ["null", "string"]
  }
]
```

## POST /api/v1/demons/:id/evidence

Controller: `DemonsController`
Handler: `createEvidence`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "params": {
    "typeName": "DemonIdParamDto",
    "shape": {
      "id": "string"
    }
  },
  "body": {
    "typeName": "EvidenceCreateDto",
    "shape": {
      "tradeId?": ["undefined", "string"],
      "dailyJournalId?": ["undefined", "string"],
      "note?": ["undefined", "string"],
      "screenshotPath?": ["undefined", "string"]
    }
  }
}
```

Response

Type: `{ id: string; createdAt: Date; updatedAt: Date; demonId: string; tradeId: string | null; dailyJournalId: string | null; note: string | null; screenshotPath: string | null; }`
Service source: `demonsService.createEvidence()`

```json
{
  "id": "string",
  "createdAt": "Date",
  "updatedAt": "Date",
  "demonId": "string",
  "tradeId": ["null", "string"],
  "dailyJournalId": ["null", "string"],
  "note": ["null", "string"],
  "screenshotPath": ["null", "string"]
}
```

## GET /api/v1/demons/:id/performance

Controller: `DemonsController`
Handler: `performance`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "params": {
    "typeName": "DemonIdParamDto",
    "shape": {
      "id": "string"
    }
  }
}
```

Response

Type: `{ date: string; id: string; createdAt: Date; demonId: string; densityScore: string | null; pnlWhenPresent: string | null; pnlWhenAbsent: string | null; winratePresent: string | null; winrateAbsent: string | null; snapshotJson: Record<...> | null; }[]`
Service source: `demonsService.performance()`

```json
[
  {
    "date": "string",
    "id": "string",
    "createdAt": "Date",
    "demonId": "string",
    "densityScore": ["null", "string"],
    "pnlWhenPresent": ["null", "string"],
    "pnlWhenAbsent": ["null", "string"],
    "winratePresent": ["null", "string"],
    "winrateAbsent": ["null", "string"],
    "snapshotJson": ["null", "Record<string, unknown>"]
  }
]
```

## GET /api/v1/economic-calendar

Controller: `EconomicCalendarController`
Handler: `getEvents`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "query": {
    "typeName": "EconomicCalendarQueryDto",
    "shape": {
      "from": "string",
      "to": "string",
      "impact?": ["undefined", "string"],
      "currency?": ["undefined", "string"]
    }
  }
}
```

Response

Type: `EconomicCalendarEvent[]`
Service source: `economicCalendarService.getEvents()`

```json
[
  {
    "id": "string",
    "title": "string",
    "impact?": ["undefined", "string"],
    "currency?": ["undefined", "string"],
    "eventTime": "string",
    "raw?": ["undefined", "Record<string, unknown>"]
  }
]
```

## GET /api/v1/export/journals.csv

Controller: `ImportExportController`
Handler: `exportJournals`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "query": {
    "typeName": "ExportQueryDto",
    "shape": {
      "date_from?": ["undefined", "string"],
      "date_to?": ["undefined", "string"]
    }
  }
}
```

Response

Type: `string`
Service source: `importExportService.exportJournalsCsv()`

```json
"string"
```

## GET /api/v1/export/trades.csv

Controller: `ImportExportController`
Handler: `exportTrades`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "query": {
    "typeName": "ExportQueryDto",
    "shape": {
      "date_from?": ["undefined", "string"],
      "date_to?": ["undefined", "string"]
    }
  }
}
```

Response

Type: `string`
Service source: `importExportService.exportTradesCsv()`

```json
"string"
```

## GET /api/v1/health

Controller: `HealthController`
Handler: `health`
Auth: Public
Roles: -
Guards: -

Request

```json
{}
```

Response

Type: `{ status: string; }`

```json
{
  "status": "string"
}
```

## POST /api/v1/import/trades

Controller: `ImportExportController`
Handler: `importTrades`
Auth: Required
Roles: -
Guards: -

Request

```json
{}
```

Response

Type: `{ imported_count: number; errors: { row: number; message: string; }[]; }`
Service source: `importExportService.importTradesCsv()`

```json
{
  "imported_count": "number",
  "errors": [
    {
      "row": "number",
      "message": "string"
    }
  ]
}
```

## GET /api/v1/instruments

Controller: `InstrumentsController`
Handler: `list`
Auth: Required
Roles: -
Guards: -

Request

```json
{}
```

Response

Type: `InstrumentResponse[]`
Service source: `instrumentsService.list()`

```json
[
  {
    "symbol": "string",
    "id": "string",
    "createdAt": "Date",
    "updatedAt": "Date",
    "category": "string"
  }
]
```

## POST /api/v1/instruments

Controller: `InstrumentsController`
Handler: `create`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "body": {
    "typeName": "InstrumentCreateDto",
    "shape": {
      "symbol": "string",
      "category": "string"
    }
  }
}
```

Response

Type: `{ symbol: string; id: string; createdAt: Date; updatedAt: Date; category: string; }`
Service source: `instrumentsService.create()`

```json
{
  "symbol": "string",
  "id": "string",
  "createdAt": "Date",
  "updatedAt": "Date",
  "category": "string"
}
```

## GET /api/v1/search

Controller: `SearchController`
Handler: `search`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "query": {
    "typeName": "SearchQueryDto",
    "shape": {
      "q": "string"
    }
  }
}
```

Response

Type: `SearchResponse`
Service source: `searchService.search()`

```json
{
  "instruments": [
    {
      "id": "string",
      "symbol": "string",
      "category": "string"
    }
  ],
  "tags": [
    {
      "id": "string",
      "name": "string",
      "createdAt": "Date",
      "updatedAt": "Date"
    }
  ],
  "strategies": [
    {
      "id": "string",
      "name": "string",
      "description": ["null", "string"],
      "tags": ["string"],
      "playbookScoreSchema": ["null", "Record<string, unknown>"],
      "createdAt": "Date",
      "updatedAt": "Date"
    }
  ],
  "demons": [
    {
      "id": "string",
      "name": "string",
      "trigger": ["null", "string"],
      "pattern": ["null", "string"],
      "consequence": ["null", "string"],
      "counterPlan": ["null", "string"],
      "preventionChecklist": ["string"],
      "createdAt": "Date",
      "updatedAt": "Date"
    }
  ],
  "notes": [
    {
      "id": "string",
      "thesis": ["null", "string"],
      "postAnalysis": ["null", "string"],
      "notes": ["null", "string"]
    }
  ]
}
```

## GET /api/v1/settings

Controller: `SettingsController`
Handler: `getSettings`
Auth: Required
Roles: -
Guards: -

Request

```json
{}
```

Response

Type: `AppSettingsResponse | null`
Service source: `settingsService.getSettings()`

```json
[
  "null",
  {
    "id": "string",
    "createdAt": "Date",
    "updatedAt": "Date",
    "defaultTimezone": "string",
    "defaultCurrency": "string",
    "defaultDateRangePreset": "string",
    "sessionDefinitions": [
      "null",
      [
        {
          "key": "string",
          "label": "string",
          "start": "string",
          "end": "string"
        }
      ]
    ],
    "riskParameters": ["null", "Record<string, unknown>"]
  }
]
```

## PUT /api/v1/settings

Controller: `SettingsController`
Handler: `updateSettings`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "body": {
    "typeName": "UpdateSettingsDto",
    "shape": {
      "defaultTimezone": "string",
      "defaultCurrency": "string",
      "defaultDateRangePreset": "string",
      "sessionDefinitions?": [
        "undefined",
        [
          {
            "key": "string",
            "label": "string",
            "start": "string",
            "end": "string"
          }
        ]
      ],
      "riskParameters?": ["undefined", "Record<string, unknown>"]
    }
  }
}
```

Response

Type: `{ id: string; createdAt: Date; updatedAt: Date; defaultTimezone: string; defaultCurrency: string; defaultDateRangePreset: string; sessionDefinitions: { key: string; label: string; start: string; end: string; }[] | null; riskParameters: Record<...> | null; }`
Service source: `settingsService.updateSettings()`

```json
{
  "id": "string",
  "createdAt": "Date",
  "updatedAt": "Date",
  "defaultTimezone": "string",
  "defaultCurrency": "string",
  "defaultDateRangePreset": "string",
  "sessionDefinitions": [
    "null",
    [
      {
        "key": "string",
        "label": "string",
        "start": "string",
        "end": "string"
      }
    ]
  ],
  "riskParameters": ["null", "Record<string, unknown>"]
}
```

## GET /api/v1/strategies

Controller: `StrategiesController`
Handler: `list`
Auth: Required
Roles: -
Guards: -

Request

```json
{}
```

Response

Type: `{ id: string; name: string; description: string | null; createdAt: Date; updatedAt: Date; tags: string[]; playbookScoreSchema: Record<string, unknown> | null; }[]`
Service source: `strategiesService.list()`

```json
[
  {
    "id": "string",
    "name": "string",
    "description": ["null", "string"],
    "createdAt": "Date",
    "updatedAt": "Date",
    "tags": ["string"],
    "playbookScoreSchema": ["null", "Record<string, unknown>"]
  }
]
```

## POST /api/v1/strategies

Controller: `StrategiesController`
Handler: `create`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "body": {
    "typeName": "StrategyCreateDto",
    "shape": {
      "name": "string",
      "tags": ["string"],
      "steps": [
        {
          "stepIndex": "number",
          "title": "string",
          "description?": ["undefined", "string"]
        }
      ],
      "confluences": [
        {
          "name": "string",
          "impactWeight": "number",
          "ruleType": "string",
          "sortOrder": "number",
          "ruleConfig?": ["undefined", "Record<string, unknown>"]
        }
      ],
      "description?": ["undefined", "string"],
      "playbookScoreSchema?": ["undefined", "Record<string, unknown>"]
    }
  }
}
```

Response

Type: `StrategyDetailResponse`
Service source: `strategiesService.create()`

```json
{
  "steps": [
    {
      "id": "string",
      "description": ["null", "string"],
      "createdAt": "Date",
      "updatedAt": "Date",
      "strategyId": "string",
      "stepIndex": "number",
      "title": "string"
    }
  ],
  "confluences": [
    {
      "id": "string",
      "name": "string",
      "createdAt": "Date",
      "updatedAt": "Date",
      "strategyId": "string",
      "impactWeight": "string",
      "ruleType": "string",
      "ruleConfig": ["null", "Record<string, unknown>"],
      "sortOrder": "number"
    }
  ],
  "id": "string",
  "name": "string",
  "description": ["null", "string"],
  "createdAt": "Date",
  "updatedAt": "Date",
  "tags": ["string"],
  "playbookScoreSchema": ["null", "Record<string, unknown>"]
}
```

## GET /api/v1/strategies/:id

Controller: `StrategiesController`
Handler: `get`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "params": {
    "typeName": "StrategyIdParamDto",
    "shape": {
      "id": "string"
    }
  }
}
```

Response

Type: `StrategyDetailResponse`
Service source: `strategiesService.getById()`

```json
{
  "steps": [
    {
      "id": "string",
      "description": ["null", "string"],
      "createdAt": "Date",
      "updatedAt": "Date",
      "strategyId": "string",
      "stepIndex": "number",
      "title": "string"
    }
  ],
  "confluences": [
    {
      "id": "string",
      "name": "string",
      "createdAt": "Date",
      "updatedAt": "Date",
      "strategyId": "string",
      "impactWeight": "string",
      "ruleType": "string",
      "ruleConfig": ["null", "Record<string, unknown>"],
      "sortOrder": "number"
    }
  ],
  "id": "string",
  "name": "string",
  "description": ["null", "string"],
  "createdAt": "Date",
  "updatedAt": "Date",
  "tags": ["string"],
  "playbookScoreSchema": ["null", "Record<string, unknown>"]
}
```

## PUT /api/v1/strategies/:id

Controller: `StrategiesController`
Handler: `update`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "params": {
    "typeName": "StrategyIdParamDto",
    "shape": {
      "id": "string"
    }
  },
  "body": {
    "typeName": "StrategyUpdateDto",
    "shape": {
      "name?": ["undefined", "string"],
      "description?": ["undefined", "string"],
      "tags?": ["undefined", ["string"]],
      "playbookScoreSchema?": ["undefined", "Record<string, unknown>"],
      "steps?": [
        "undefined",
        [
          {
            "stepIndex": "number",
            "title": "string",
            "description?": ["undefined", "string"]
          }
        ]
      ],
      "confluences?": [
        "undefined",
        [
          {
            "name": "string",
            "impactWeight": "number",
            "ruleType": "string",
            "sortOrder": "number",
            "ruleConfig?": ["undefined", "Record<string, unknown>"]
          }
        ]
      ]
    }
  }
}
```

Response

Type: `StrategyDetailResponse`
Service source: `strategiesService.update()`

```json
{
  "steps": [
    {
      "id": "string",
      "description": ["null", "string"],
      "createdAt": "Date",
      "updatedAt": "Date",
      "strategyId": "string",
      "stepIndex": "number",
      "title": "string"
    }
  ],
  "confluences": [
    {
      "id": "string",
      "name": "string",
      "createdAt": "Date",
      "updatedAt": "Date",
      "strategyId": "string",
      "impactWeight": "string",
      "ruleType": "string",
      "ruleConfig": ["null", "Record<string, unknown>"],
      "sortOrder": "number"
    }
  ],
  "id": "string",
  "name": "string",
  "description": ["null", "string"],
  "createdAt": "Date",
  "updatedAt": "Date",
  "tags": ["string"],
  "playbookScoreSchema": ["null", "Record<string, unknown>"]
}
```

## DELETE /api/v1/strategies/:id

Controller: `StrategiesController`
Handler: `remove`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "params": {
    "typeName": "StrategyIdParamDto",
    "shape": {
      "id": "string"
    }
  }
}
```

Response

Type: `ActionSuccessResponse`
Service source: `strategiesService.remove()`

```json
{
  "success": "boolean"
}
```

## GET /api/v1/strategies/:id/analytics

Controller: `StrategiesController`
Handler: `analytics`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "params": {
    "typeName": "StrategyIdParamDto",
    "shape": {
      "id": "string"
    }
  }
}
```

Response

Type: `StrategyAnalyticsResponse`
Service source: `strategiesService.analytics()`

```json
{
  "kpis": {
    "trades_count": "number",
    "net_pnl": "number",
    "win_rate": "number"
  },
  "trades": [
    {
      "id": "string",
      "accountId": "string",
      "instrumentId": "string",
      "pnl": ["null", "string"],
      "entryDatetime": "Date"
    }
  ]
}
```

## POST /api/v1/trade-attachments

Controller: `TradesController`
Handler: `uploadAttachment`
Auth: Required
Roles: -
Guards: -

Request

```json
{}
```

Response

Type: `{ id: string; createdAt: Date; updatedAt: Date; tradeId: string; filePath: string; caption: string | null; }`
Service source: `tradesService.addAttachment()`

```json
{
  "id": "string",
  "createdAt": "Date",
  "updatedAt": "Date",
  "tradeId": "string",
  "filePath": "string",
  "caption": ["null", "string"]
}
```

## DELETE /api/v1/trade-attachments/:id

Controller: `TradesController`
Handler: `deleteAttachment`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "params": {
    "typeName": "TradeAttachmentIdParamDto",
    "shape": {
      "id": "string"
    }
  }
}
```

Response

Type: `{ success: boolean; }`
Service source: `tradesService.deleteAttachment()`

```json
{
  "success": "boolean"
}
```

## GET /api/v1/trades

Controller: `TradesController`
Handler: `list`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "query": {
    "typeName": "TradeListQueryDto",
    "shape": {
      "page": "number",
      "page_size": "number",
      "account_id?": ["undefined", "string"],
      "instrument_id?": ["undefined", "string"],
      "strategy_id?": ["undefined", "string"],
      "type?": ["undefined", "executed", "missed"],
      "date_from?": ["undefined", "string"],
      "date_to?": ["undefined", "string"],
      "session?": ["undefined", "string"],
      "tags?": ["undefined", "string"],
      "demons?": ["undefined", "string"]
    }
  }
}
```

Response

Type: `TradesListResponse`
Service source: `tradesService.list()`

```json
{
  "rows": [
    {
      "id": "string",
      "createdAt": "Date",
      "updatedAt": "Date",
      "type": ["executed", "missed"],
      "timezone": "string",
      "deletedAt": ["null", "Date"],
      "accountId": "string",
      "instrumentId": "string",
      "direction": ["long", "short"],
      "entryDatetime": "Date",
      "exitDatetime": ["null", "Date"],
      "entryTimeframe": ["null", "string"],
      "tradingSession": ["null", "string"],
      "entryPrice": ["null", "string"],
      "exitPrice": ["null", "string"],
      "stopLoss": ["null", "string"],
      "takeProfit": ["null", "string"],
      "dollarRisk": ["null", "string"],
      "positionSize": ["null", "string"],
      "positionSizeUnit": ["null", "lot", "usd", "contract"],
      "brokerCommission": ["null", "string"],
      "swap": ["null", "string"],
      "fundingFee": ["null", "string"],
      "positionType": ["null", "spot", "futures"],
      "leverage": ["null", "string"],
      "marginMode": ["null", "cross", "isolated"],
      "strategyId": ["null", "string"],
      "thesis": ["null", "string"],
      "postAnalysis": ["null", "string"],
      "notes": ["null", "string"],
      "pnl": ["null", "string"],
      "rMultiple": ["null", "string"],
      "winLossFlag": ["null", "win", "loss", "breakeven"],
      "holdingTimeSeconds": ["null", "number"],
      "holdingBucket": ["null", "scalp", "intraday", "swing", "position"],
      "decisionQualityScore": ["null", "string"]
    }
  ],
  "meta": {
    "page": "number",
    "page_size": "number",
    "total": "number"
  }
}
```

## POST /api/v1/trades

Controller: `TradesController`
Handler: `create`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "body": {
    "typeName": "TradeCreateDto",
    "shape": {
      "accountId": "string",
      "type": ["executed", "missed"],
      "instrumentId": "string",
      "direction": ["long", "short"],
      "timezone": "string",
      "entryDatetime": "string",
      "exitDatetime?": ["undefined", "string"],
      "entryTimeframe?": ["undefined", "string"],
      "tradingSession?": ["undefined", "string"],
      "entryPrice?": ["undefined", "number"],
      "exitPrice?": ["undefined", "number"],
      "stopLoss?": ["undefined", "number"],
      "takeProfit?": ["undefined", "number"],
      "dollarRisk?": ["undefined", "number"],
      "positionSize?": ["undefined", "number"],
      "positionSizeUnit?": ["undefined", "lot", "usd", "contract"],
      "brokerCommission?": ["undefined", "number"],
      "swap?": ["undefined", "number"],
      "fundingFee?": ["undefined", "number"],
      "positionType?": ["undefined", "spot", "futures"],
      "leverage?": ["undefined", "number"],
      "marginMode?": ["undefined", "cross", "isolated"],
      "strategyId?": ["undefined", "string"],
      "thesis?": ["undefined", "string"],
      "postAnalysis?": ["undefined", "string"],
      "notes?": ["undefined", "string"],
      "tagIds?": ["undefined", ["string"]],
      "demonIds?": ["undefined", ["string"]],
      "marketConditionTagIds?": ["undefined", ["string"]],
      "marketConditionIds?": ["undefined", ["string"]],
      "confluenceChecks?": [
        "undefined",
        [
          {
            "confluenceId": "string",
            "checked": "boolean"
          }
        ]
      ]
    }
  }
}
```

Response

Type: `{ trade: TradeDetailResponse; warnings: string[]; }`
Service source: `tradesService.create()`

```json
{
  "trade": {
    "attachments": [
      {
        "id": "string",
        "createdAt": "Date",
        "updatedAt": "Date",
        "tradeId": "string",
        "filePath": "string",
        "caption": ["null", "string"]
      }
    ],
    "tagIds": ["string"],
    "demonIds": ["string"],
    "confluenceChecks": [
      {
        "id": "string",
        "createdAt": "Date",
        "tradeId": "string",
        "confluenceId": "string",
        "checked": "number",
        "weightSnapshot": "string"
      }
    ],
    "id": "string",
    "createdAt": "Date",
    "updatedAt": "Date",
    "type": ["executed", "missed"],
    "timezone": "string",
    "deletedAt": ["null", "Date"],
    "accountId": "string",
    "instrumentId": "string",
    "direction": ["long", "short"],
    "entryDatetime": "Date",
    "exitDatetime": ["null", "Date"],
    "entryTimeframe": ["null", "string"],
    "tradingSession": ["null", "string"],
    "entryPrice": ["null", "string"],
    "exitPrice": ["null", "string"],
    "stopLoss": ["null", "string"],
    "takeProfit": ["null", "string"],
    "dollarRisk": ["null", "string"],
    "positionSize": ["null", "string"],
    "positionSizeUnit": ["null", "lot", "usd", "contract"],
    "brokerCommission": ["null", "string"],
    "swap": ["null", "string"],
    "fundingFee": ["null", "string"],
    "positionType": ["null", "spot", "futures"],
    "leverage": ["null", "string"],
    "marginMode": ["null", "cross", "isolated"],
    "strategyId": ["null", "string"],
    "thesis": ["null", "string"],
    "postAnalysis": ["null", "string"],
    "notes": ["null", "string"],
    "pnl": ["null", "string"],
    "rMultiple": ["null", "string"],
    "winLossFlag": ["null", "win", "loss", "breakeven"],
    "holdingTimeSeconds": ["null", "number"],
    "holdingBucket": ["null", "scalp", "intraday", "swing", "position"],
    "decisionQualityScore": ["null", "string"]
  },
  "warnings": ["string"]
}
```

## GET /api/v1/trades/:id

Controller: `TradesController`
Handler: `get`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "params": {
    "typeName": "TradeIdParamDto",
    "shape": {
      "id": "string"
    }
  }
}
```

Response

Type: `TradeDetailResponse`
Service source: `tradesService.getById()`

```json
{
  "attachments": [
    {
      "id": "string",
      "createdAt": "Date",
      "updatedAt": "Date",
      "tradeId": "string",
      "filePath": "string",
      "caption": ["null", "string"]
    }
  ],
  "tagIds": ["string"],
  "demonIds": ["string"],
  "confluenceChecks": [
    {
      "id": "string",
      "createdAt": "Date",
      "tradeId": "string",
      "confluenceId": "string",
      "checked": "number",
      "weightSnapshot": "string"
    }
  ],
  "id": "string",
  "createdAt": "Date",
  "updatedAt": "Date",
  "type": ["executed", "missed"],
  "timezone": "string",
  "deletedAt": ["null", "Date"],
  "accountId": "string",
  "instrumentId": "string",
  "direction": ["long", "short"],
  "entryDatetime": "Date",
  "exitDatetime": ["null", "Date"],
  "entryTimeframe": ["null", "string"],
  "tradingSession": ["null", "string"],
  "entryPrice": ["null", "string"],
  "exitPrice": ["null", "string"],
  "stopLoss": ["null", "string"],
  "takeProfit": ["null", "string"],
  "dollarRisk": ["null", "string"],
  "positionSize": ["null", "string"],
  "positionSizeUnit": ["null", "lot", "usd", "contract"],
  "brokerCommission": ["null", "string"],
  "swap": ["null", "string"],
  "fundingFee": ["null", "string"],
  "positionType": ["null", "spot", "futures"],
  "leverage": ["null", "string"],
  "marginMode": ["null", "cross", "isolated"],
  "strategyId": ["null", "string"],
  "thesis": ["null", "string"],
  "postAnalysis": ["null", "string"],
  "notes": ["null", "string"],
  "pnl": ["null", "string"],
  "rMultiple": ["null", "string"],
  "winLossFlag": ["null", "win", "loss", "breakeven"],
  "holdingTimeSeconds": ["null", "number"],
  "holdingBucket": ["null", "scalp", "intraday", "swing", "position"],
  "decisionQualityScore": ["null", "string"]
}
```

## PUT /api/v1/trades/:id

Controller: `TradesController`
Handler: `update`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "params": {
    "typeName": "TradeIdParamDto",
    "shape": {
      "id": "string"
    }
  },
  "body": {
    "typeName": "TradeUpdateDto",
    "shape": {
      "accountId?": ["undefined", "string"],
      "type?": ["undefined", "executed", "missed"],
      "instrumentId?": ["undefined", "string"],
      "direction?": ["undefined", "long", "short"],
      "timezone?": ["undefined", "string"],
      "entryDatetime?": ["undefined", "string"],
      "exitDatetime?": ["undefined", "string"],
      "entryTimeframe?": ["undefined", "string"],
      "tradingSession?": ["undefined", "string"],
      "entryPrice?": ["undefined", "number"],
      "exitPrice?": ["undefined", "number"],
      "stopLoss?": ["undefined", "number"],
      "takeProfit?": ["undefined", "number"],
      "dollarRisk?": ["undefined", "number"],
      "positionSize?": ["undefined", "number"],
      "positionSizeUnit?": ["undefined", "lot", "usd", "contract"],
      "brokerCommission?": ["undefined", "number"],
      "swap?": ["undefined", "number"],
      "fundingFee?": ["undefined", "number"],
      "positionType?": ["undefined", "spot", "futures"],
      "leverage?": ["undefined", "number"],
      "marginMode?": ["undefined", "cross", "isolated"],
      "strategyId?": ["undefined", "string"],
      "thesis?": ["undefined", "string"],
      "postAnalysis?": ["undefined", "string"],
      "notes?": ["undefined", "string"],
      "tagIds?": ["undefined", ["string"]],
      "demonIds?": ["undefined", ["string"]],
      "marketConditionTagIds?": ["undefined", ["string"]],
      "marketConditionIds?": ["undefined", ["string"]],
      "confluenceChecks?": [
        "undefined",
        [
          {
            "confluenceId": "string",
            "checked": "boolean"
          }
        ]
      ]
    }
  }
}
```

Response

Type: `{ trade: TradeDetailResponse; warnings: string[]; }`
Service source: `tradesService.update()`

```json
{
  "trade": {
    "attachments": [
      {
        "id": "string",
        "createdAt": "Date",
        "updatedAt": "Date",
        "tradeId": "string",
        "filePath": "string",
        "caption": ["null", "string"]
      }
    ],
    "tagIds": ["string"],
    "demonIds": ["string"],
    "confluenceChecks": [
      {
        "id": "string",
        "createdAt": "Date",
        "tradeId": "string",
        "confluenceId": "string",
        "checked": "number",
        "weightSnapshot": "string"
      }
    ],
    "id": "string",
    "createdAt": "Date",
    "updatedAt": "Date",
    "type": ["executed", "missed"],
    "timezone": "string",
    "deletedAt": ["null", "Date"],
    "accountId": "string",
    "instrumentId": "string",
    "direction": ["long", "short"],
    "entryDatetime": "Date",
    "exitDatetime": ["null", "Date"],
    "entryTimeframe": ["null", "string"],
    "tradingSession": ["null", "string"],
    "entryPrice": ["null", "string"],
    "exitPrice": ["null", "string"],
    "stopLoss": ["null", "string"],
    "takeProfit": ["null", "string"],
    "dollarRisk": ["null", "string"],
    "positionSize": ["null", "string"],
    "positionSizeUnit": ["null", "lot", "usd", "contract"],
    "brokerCommission": ["null", "string"],
    "swap": ["null", "string"],
    "fundingFee": ["null", "string"],
    "positionType": ["null", "spot", "futures"],
    "leverage": ["null", "string"],
    "marginMode": ["null", "cross", "isolated"],
    "strategyId": ["null", "string"],
    "thesis": ["null", "string"],
    "postAnalysis": ["null", "string"],
    "notes": ["null", "string"],
    "pnl": ["null", "string"],
    "rMultiple": ["null", "string"],
    "winLossFlag": ["null", "win", "loss", "breakeven"],
    "holdingTimeSeconds": ["null", "number"],
    "holdingBucket": ["null", "scalp", "intraday", "swing", "position"],
    "decisionQualityScore": ["null", "string"]
  },
  "warnings": ["string"]
}
```

## POST /api/v1/trades/:id/context-events

Controller: `EconomicCalendarController`
Handler: `attach`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "params": {
    "typeName": "TradeIdParamDto",
    "shape": {
      "id": "string"
    }
  },
  "body": {
    "typeName": "AttachContextEventDto",
    "shape": {
      "providerEventId": "string",
      "title": "string",
      "eventTime": "string",
      "impact?": ["undefined", "string"],
      "currency?": ["undefined", "string"],
      "raw?": ["undefined", "Record<string, unknown>"]
    }
  }
}
```

Response

Type: `{ id: string; createdAt: Date; raw: string | null; tradeId: string; title: string; providerEventId: string; impact: string | null; currency: string | null; eventTime: Date; }`
Service source: `economicCalendarService.attachEventToTrade()`

```json
{
  "id": "string",
  "createdAt": "Date",
  "raw": ["null", "string"],
  "tradeId": "string",
  "title": "string",
  "providerEventId": "string",
  "impact": ["null", "string"],
  "currency": ["null", "string"],
  "eventTime": "Date"
}
```

## POST /api/v1/trades/bulk

Controller: `TradesController`
Handler: `bulk`
Auth: Required
Roles: -
Guards: -

Request

```json
{
  "body": {
    "typeName": "TradeBulkDto",
    "shape": {
      "tradeIds": ["string"],
      "strategyId?": ["undefined", "string"],
      "tagIds?": ["undefined", ["string"]]
    }
  }
}
```

Response

Type: `{ success: boolean; }`
Service source: `tradesService.bulkUpdate()`

```json
{
  "success": "boolean"
}
```

## GET /api/v1/users/me

Controller: `UsersController`
Handler: `me`
Auth: Required
Roles: -
Guards: -

Request

```json
{}
```

Response

Type: `UserProfile | null`
Service source: `usersService.findProfileById()`

```json
[
  "null",
  {
    "id": "string",
    "email": "string",
    "name": "string",
    "googleId": ["null", "string"],
    "isActive": "boolean",
    "roles": [["ADMIN", "USER"]],
    "createdAt": "Date",
    "updatedAt": "Date"
  }
]
```
