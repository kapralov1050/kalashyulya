# Testing Coverage Design for Kalashyulya Project

**Date:** 2026-03-01
**Status:** Approved
**Author:** Claude Sonnet 4.6

## Overview

This design outlines an incremental approach to adding unit test coverage to the Kalashyulya Nuxt 3 project. The implementation starts with simple utilities and helpers, then progressively expands to composables, stores, and components.

## Architecture

### Test Structure (Co-location)

```
utils/__tests__/          - Test files for utilities
composables/__tests__/    - Test files for composables
stores/__tests__/         - Test files for Pinia stores
components/__tests__/     - Test files for Vue components (future)
```

### Tools and Frameworks

- **Vitest** - Test runner (already installed)
- **Happy-DOM** - DOM testing environment (already configured)
- **@vue/test-utils** - Vue component testing utilities (already installed)

### Naming Convention

- Format: `[filename].spec.ts`
- Location: `__tests__/` directory alongside tested file
- Example: `utils/pluralize.ts` → `utils/__tests__/pluralize.spec.ts`

## Phase 1: Utils & Helpers (Current Focus)

### Files to Test

**Utils:**
- `utils/pluralize.ts` - Pluralization functions
- `utils/metrics.ts` - Metrics and measurement calculations
- `utils/slugify.ts` - Text slug generation
- `utils/statsFormatters.ts` - Statistics formatting

**Helpers:**
- `helpers/showToast.ts` - Toast notification display
- `helpers/useImages.ts` - Image handling utilities
- `helpers/scrollAnimation.ts` - Scroll animation utilities
- `helpers/valibot/*` - Validation schemas (optional)

### Exclusions

- `helpers/firebase/*` - Too dependent on Firebase
- `helpers/valibot/*` - Optional, library provides its own validation

### Testing Approach

- **Minimal coverage:** 2-3 test cases per file
- **Critical functions focus:** Main usage scenarios only
- **Unit tests only:** Isolated from external dependencies
- **Pure functions:** Deterministic behavior, easy to test

### Data Flow

**Standard Flow:**
```
Input (parameters) → Function → Output (return value)
```

**Example (`pluralize.ts`):**
```
1 → pluralize(1, "товар", "товара", "товаров") → "товар"
5 → pluralize(5, "товар", "товара", "товаров") → "товаров"
```

**Side Effects Handling:**
- `showToast.ts` - Mock toast notification system
- `scrollAnimation.ts` - Mock DOM API if needed

### Advantages

- Simple data flow → fast, reliable tests
- No state dependencies → easy maintenance
- Minimal setup → quick feedback
- Clean functions → predictable results

## Phase 2: Composables (Future)

- Test business logic in composables
- Mock Vue composables and hooks
- Test reactive behavior
- 3-5 test cases per composable

## Phase 3: Stores (Future)

- Test Pinia store actions, getters, mutations
- Test state management logic
- Mock external API calls
- 4-6 test cases per store

## Phase 4: Components (Future)

- Test Vue components with @vue/test-utils
- Test user interactions
- Test component rendering
- 5-8 test cases per component

## Implementation Strategy

1. Start with simplest utilities
2. Add minimal test coverage (2-3 cases per file)
3. Establish testing patterns and conventions
4. Gradually expand to more complex modules
5. Maintain consistency across all test files

## Success Criteria

- All Phase 1 files have at least 2 passing tests
- Tests run successfully with `npm run test`
- CI/CD pipeline includes test execution
- Test coverage report available via `npm run test:coverage`

## Next Steps

This design document serves as the foundation for the implementation plan, which will detail specific test cases, mocking strategies, and development workflow.
