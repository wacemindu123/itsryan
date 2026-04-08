# Testing Strategy

## Overview

Every code change must pass **both frontend and backend tests** before being pushed. Run `npm test` locally before every commit.

## Stack

| Tool | Purpose |
|------|---------|
| **Jest** | Test runner + assertions |
| **ts-jest** | TypeScript transform for Jest |
| **@testing-library/react** | Component rendering + queries |
| **@testing-library/jest-dom** | DOM matchers (`toBeInTheDocument`, etc.) |
| **@testing-library/user-event** | Simulating user interactions |

## Commands

```bash
npm test              # Run all tests
npm run test:coverage # Run with coverage report
```

## Test Environments

- **`node`** — Used for server-side code (API routes, lib utilities, Supabase clients). Set via docblock:
  ```ts
  /**
   * @jest-environment node
   */
  ```
- **`jsdom`** (default) — Used for React components and hooks that touch the DOM.

## Directory Structure

```
src/
  __tests__/
    setup.ts              # Global setup (jest-dom matchers)
    lib/
      crud.test.ts        # CRUD factory (GET/POST/PUT/DELETE handlers)
      supabase.test.ts    # Supabase client creation + caching
    hooks/
      useInView.test.tsx  # IntersectionObserver hook
    components/
      Footer.test.tsx     # Footer rendering + content assertions
    api/
      routes.test.ts      # API route config validation
```

## What to Test

### Backend (API / Server)

| Layer | What to cover | Example |
|-------|--------------|---------|
| **CRUD factory** (`lib/crud.ts`) | GET returns data, POST validates required fields, PUT requires ID, DELETE by body/query, auth denial returns 401 | `crud.test.ts` |
| **Supabase client** (`lib/supabase.ts`) | Client creation, caching, env var fallbacks, missing env throws | `supabase.test.ts` |
| **API route configs** (`app/api/*/route.ts`) | Correct table, entity name, required fields, `prepareInsert` defaults, `deleteIdFromQuery` flag | `routes.test.ts` |
| **Auth** (`lib/auth.ts`) | Mocked via `jest.mock` in CRUD tests to verify 401 on unauthenticated requests | `crud.test.ts` |

### Frontend (Components / Hooks)

| Layer | What to cover | Example |
|-------|--------------|---------|
| **Components** | Renders correct content, links have correct hrefs, no stale copy (e.g. "Atlanta"), analytics wiring | `Footer.test.tsx` |
| **Hooks** | State transitions, cleanup on unmount, edge cases (null refs) | `useInView.test.tsx` |
| **Admin pages** | Data loading, user actions (checkbox toggle, button clicks), conditional rendering | Future: `submissions.test.tsx` |

## Writing New Tests — Checklist

1. **Pick the right environment** — server code → `node`, UI code → `jsdom`
2. **Mock external dependencies** — Supabase, Clerk auth, analytics, fetch calls
3. **Test behaviour, not implementation** — assert on outputs and side effects, not internal state
4. **Cover the happy path + at least one error path** — e.g. missing required field, DB failure, auth denied
5. **Use `act()` for React state updates** — wrap any callback that triggers `setState` in `act()`
6. **Keep tests fast** — no real network calls, no real DB. Everything mocked.

## Mocking Patterns

### Supabase
```ts
jest.mock('@/lib/supabase', () => ({
  createServerSupabaseClient: () => ({ from: mockFrom }),
}));
```

### Clerk Auth
```ts
jest.mock('@/lib/auth', () => ({
  requireAdmin: jest.fn().mockResolvedValue(null), // authenticated
}));
```

### Analytics
```ts
jest.mock('@/lib/analytics', () => ({
  analytics: { externalLinkClick: jest.fn() },
}));
```

### IntersectionObserver
```ts
global.IntersectionObserver = jest.fn((cb) => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  // trigger: cb([{ isIntersecting: true }])
}));
```

## Pre-Push Workflow

```
1. Make changes
2. npm test          ← must pass
3. npm run build     ← must pass
4. git add + commit
5. git push
```

**Never push code that fails tests or build.**

## Adding Coverage for New Features

When you add a new feature, add tests for:

- **New API route** → Add a config test in `__tests__/api/routes.test.ts` verifying table, required fields, and `prepareInsert`
- **New lib utility** → Add a dedicated test file in `__tests__/lib/`
- **New component** → Add a test file in `__tests__/components/` checking renders and key content
- **New hook** → Add a test file in `__tests__/hooks/` covering state transitions and cleanup
