# Code Quality Audit Inventory

This inventory captures maintainability hotspots, severity, and remediation direction for the first full quality pass.

## Critical

- `src/server/api/routers/database.ts`
  - **Risk**: Blanket suppression (`@ts-nocheck`, `/* eslint-disable */`) in admin data router with dynamic model access and weak payload typing.
  - **Impact**: Type-safety blind spots in high-privilege CRUD operations.
  - **Action**: Remove file-level suppression, narrow data schemas, centralize delegate operations, and apply typed error handling.

- `src/app/forms/forms-submit-client.tsx`
  - **Risk**: File-level suppression and `any`-style upload branch handling.
  - **Impact**: Runtime-only failures on submissions and upload payload shape mismatch.
  - **Action**: Replace unsafe upload branch with discriminated union and typed normalization helpers.

- `src/app/(with-sidebar)/schedule/page.tsx`
  - **Risk**: `@ts-nocheck`, mixed orchestration + UI + permission logic.
  - **Impact**: Hard-to-test page logic with fragile mutation/update flow.
  - **Action**: Extract event mapping/filtering/permission helpers and remove suppression.

## High

- `src/app/admin/forms/forms-builder.tsx`
  - **Risk**: File-level suppression and growing monolithic UI component.
  - **Impact**: More difficult maintenance as question types/settings expand.
  - **Action**: Remove suppressions and isolate reusable section components.

- `src/hooks/use-notifications.ts`
  - **Risk**: Excessive runtime console diagnostics mixed with business logic.
  - **Impact**: Noisy production logs and brittle debugging behavior.
  - **Action**: Introduce environment-gated logger and shared error serializer.

- `src/server/api/routers/course.ts`
  - **Risk**: Duplicate procedures (`delete` and `deleteCourse`) and repeated member removal patterns.
  - **Impact**: Logic drift risk and unnecessary maintenance overhead.
  - **Action**: Consolidate duplicate procedures and extract shared membership checks.

## Medium

- `src/server/action/index.ts`
  - **Risk**: Mixed cache/data/upload/navigation responsibilities in one module.
  - **Action**: Split into focused action modules with explicit boundaries.

- `src/app/admin/tryouts/create/question-builder.tsx`
  - **Risk**: Large component with repeated handlers and broad local state.
  - **Action**: Extract upload and state-management hooks.

- `src/components/event-calendar/agenda-view.tsx`
  - **Risk**: Debug logging in rendering path.
  - **Action**: Remove logs or gate behind development-only logger.

## Delivery Order

1. Remove broad suppressions and unsafe typing in critical files.
2. Extract helper modules from page/router hotspots.
3. Standardize error handling and runtime logging policy.
4. Add CI/test/hook quality gates.
5. Run lint/typecheck/tests and resolve regressions.
