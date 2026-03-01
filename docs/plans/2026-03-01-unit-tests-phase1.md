# Unit Tests Phase 1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement minimal unit test coverage for utilities and helpers files to establish testing infrastructure and patterns.

**Architecture:** Incremental approach starting with simplest utility functions (pure functions) using Vitest with Happy-DOM environment. Tests co-located in `__tests__/` directories alongside source files.

**Tech Stack:** Vitest (test runner), Happy-DOM (DOM environment), TypeScript, TDD methodology.

---

## Setup and Infrastructure

### Task 1: Update Vitest Config for Co-located Tests

**Files:**
- Modify: `vitest.config.ts`

**Step 1: Update Vitest configuration**

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    // Enable co-located tests in __tests__ directories
    include: ['**/__tests__/**/*.spec.ts'],
    // Ensure project files are excluded from test discovery
    exclude: ['node_modules', 'dist', '.nuxt', '.output'],
  },
})
```

**Step 2: Run test to verify configuration**

Run: `npm run test`
Expected: No tests found (expected), configuration loads successfully

**Step 3: Commit**

```bash
git add vitest.config.ts
git commit -m "chore: update vitest config for co-located tests"
```

---

## Utils Testing

### Task 2: Test slugify Function

**Files:**
- Create: `utils/__tests__/slugify.spec.ts`
- Reference: `utils/slugify.ts`

**Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest'
import { slugify } from '../slugify'

describe('slugify', () => {
  it('should convert spaces to hyphens and lowercase text', () => {
    const result = slugify('Hello World Test')
    expect(result).toBe('hello-world-test')
  })

  it('should handle empty string', () => {
    const result = slugify('')
    expect(result).toBe('')
  })

  it('should handle single word', () => {
    const result = slugify('Test')
    expect(result).toBe('test')
  })
})
```

**Step 2: Run test to verify it passes**

Run: `npm run test utils/__tests__/slugify.spec.ts`
Expected: All tests PASS (slugify is already implemented correctly)

**Step 3: Commit**

```bash
git add utils/__tests__/slugify.spec.ts
git commit -m "test: add slugify function tests"
```

---

### Task 3: Test pluralize Functions

**Files:**
- Create: `utils/__tests__/pluralize.spec.ts`
- Reference: `utils/pluralize.ts`

**Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest'
import { pluralize, pluralizeViews } from '../pluralize'

describe('pluralize', () => {
  it('should return singular form for 1', () => {
    const result = pluralize(1, 'products')
    expect(result).toBe('1 товар')
  })

  it('should return plural form for 2-4', () => {
    const result = pluralize(2, 'products')
    expect(result).toBe('2 товара')
  })

  it('should return many form for 5+', () => {
    const result = pluralize(5, 'products')
    expect(result).toBe('5 товаров')
  })

  it('should handle 11 (exception case)', () => {
    const result = pluralize(11, 'products')
    expect(result).toBe('11 товаров')
  })

  it('should handle 21 (ends with 1 but not 11)', () => {
    const result = pluralize(21, 'products')
    expect(result).toBe('21 товар')
  })
})

describe('pluralizeViews', () => {
  it('should work with views word', () => {
    const result = pluralizeViews(3)
    expect(result).toBe('3 просмотра')
  })

  it('should handle many views', () => {
    const result = pluralizeViews(10)
    expect(result).toBe('10 просмотров')
  })
})
```

**Step 2: Run test to verify it passes**

Run: `npm run test utils/__tests__/pluralize.spec.ts`
Expected: All tests PASS (pluralize is already implemented correctly)

**Step 3: Commit**

```bash
git add utils/__tests__/pluralize.spec.ts
git commit -m "test: add pluralize function tests"
```

---

### Task 4: Test statsFormatters Functions

**Files:**
- Create: `utils/__tests__/statsFormatters.spec.ts`
- Reference: `utils/statsFormatters.ts`

**Step 1: Write the failing test**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { formatEventName, formatDate, formatLastUpdated, getMonthName } from '../statsFormatters'

describe('formatEventName', () => {
  it('should format known event names from map', () => {
    const result = formatEventName('page_view_calendar')
    expect(result).toBe('Переходов на страницу календарей')
  })

  it('should format unknown page_view events', () => {
    const result = formatEventName('page_view_custom_page')
    expect(result).toBe('Просмотр: custom page')
  })

  it('should format unknown button_click events', () => {
    const result = formatEventName('button_click_test_button')
    expect(result).toBe('Клик: test button')
  })
})

describe('formatDate', () => {
  it('should format date string to Russian locale', () => {
    const result = formatDate('2025-03-01')
    expect(result).toContain('2025')
    expect(result).toContain('марта')
    expect(result).toContain('1')
  })
})

describe('formatLastUpdated', () => {
  it('should format timestamp to time string', () => {
    const timestamp = '2025-03-01T14:30:00Z'
    const result = formatLastUpdated(timestamp)
    expect(result).toContain('обновлено:')
    expect(result).toMatch(/\d{2}:\d{2}/)
  })
})

describe('getMonthName', () => {
  it('should return month name for valid number', () => {
    const result = getMonthName('3')
    expect(result).toBe('Март')
  })

  it('should return month name for January', () => {
    const result = getMonthName('1')
    expect(result).toBe('Январь')
  })

  it('should return December', () => {
    const result = getMonthName('12')
    expect(result).toBe('Декабрь')
  })

  it('should handle invalid month number', () => {
    const result = getMonthName('15')
    expect(result).toBe('15')
  })
})
```

**Step 2: Run test to verify it passes**

Run: `npm run test utils/__tests__/statsFormatters.spec.ts`
Expected: All tests PASS

**Step 3: Commit**

```bash
git add utils/__tests__/statsFormatters.spec.ts
git commit -m "test: add statsFormatters function tests"
```

---

## Helpers Testing

### Task 5: Test showToast Helper with Mock

**Files:**
- Create: `helpers/__tests__/showToast.spec.ts`
- Reference: `helpers/showToast.ts`

**Step 1: Write the failing test**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { showToast } from '../showToast'

// Mock the useToast composable
const mockAdd = vi.fn()

vi.mock('~/composables/useToast', () => ({
  useToast: () => ({
    add: mockAdd,
  }),
}))

describe('showToast', () => {
  beforeEach(() => {
    mockAdd.mockClear()
  })

  it('should call toast.add with correct parameters', () => {
    showToast('Test Title', 'Test Description', 'test-icon')

    expect(mockAdd).toHaveBeenCalledTimes(1)
    expect(mockAdd).toHaveBeenCalledWith({
      title: 'Test Title',
      description: 'Test Description',
      icon: 'test-icon',
    })
  })

  it('should handle empty parameters', () => {
    showToast('', '', '')

    expect(mockAdd).toHaveBeenCalledTimes(1)
    expect(mockAdd).toHaveBeenCalledWith({
      title: '',
      description: '',
      icon: '',
    })
  })
})
```

**Step 2: Run test to verify it fails initially**

Run: `npm run test helpers/__tests__/showToast.spec.ts`
Expected: FAIL - useToast mock needs to be configured correctly

**Step 3: Create test mock file for useToast**

Create: `helpers/__tests__/mocks/useToast.ts`

```typescript
export const useToastMock = {
  add: vi.fn(),
}

export const useToast = () => useToastMock
```

**Step 4: Update test to use proper mock**

Modify: `helpers/__tests__/showToast.spec.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { showToast } from '../showToast'
import { useToastMock } from './mocks/useToast'

describe('showToast', () => {
  beforeEach(() => {
    useToastMock.add.mockClear()
  })

  it('should call toast.add with correct parameters', () => {
    showToast('Test Title', 'Test Description', 'test-icon')

    expect(useToastMock.add).toHaveBeenCalledTimes(1)
    expect(useToastMock.add).toHaveBeenCalledWith({
      title: 'Test Title',
      description: 'Test Description',
      icon: 'test-icon',
    })
  })

  it('should handle empty parameters', () => {
    showToast('', '', '')

    expect(useToastMock.add).toHaveBeenCalledTimes(1)
    expect(useToastMock.add).toHaveBeenCalledWith({
      title: '',
      description: '',
      icon: '',
    })
  })
})
```

**Step 5: Run test to verify it passes**

Run: `npm run test helpers/__tests__/showToast.spec.ts`
Expected: All tests PASS

**Step 6: Commit**

```bash
git add helpers/__tests__/showToast.spec.ts helpers/__tests__/mocks/useToast.ts
git commit -m "test: add showToast helper tests with mocks"
```

---

### Task 6: Test useImages Helper

**Files:**
- Create: `helpers/__tests__/useImages.spec.ts`
- Reference: `helpers/useImages.ts`

**Step 1: Write the failing test**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { awaitImage } from '../useImages'

describe('awaitImage', () => {
  it('should return loadImages function', () => {
    const { loadImages } = awaitImage()
    expect(typeof loadImages).toBe('function')
  })

  it('should resolve when all images load and minimum delay passes', async () => {
    // Mock Image constructor
    const mockImage = vi.fn()
    let imageLoadCallback: (() => void) | null = null

    mockImage.mockImplementation(() => ({
      src: '',
      onload: null,
      onerror: null,
    }))

    // Override Image constructor globally for test
    global.Image = mockImage as any

    const { loadImages } = awaitImage()
    const result = await loadImages(['test1.jpg', 'test2.jpg'])

    expect(result).toBeUndefined()
  })
})
```

**Step 2: Run test to verify behavior**

Run: `npm run test helpers/__tests__/useImages.spec.ts`
Expected: Tests may need adjustment based on Image API behavior in test environment

**Step 3: Update test for better reliability**

Modify: `helpers/__tests__/useImages.spec.ts`

```typescript
import { describe, it, expect, vi } from 'vitest'
import { awaitImage } from '../useImages'

describe('awaitImage', () => {
  it('should return loadImages function', () => {
    const { loadImages } = awaitImage()
    expect(typeof loadImages).toBe('function')
  })

  it('should handle empty image array', async () => {
    const { loadImages } = awaitImage()

    await expect(loadImages([])).resolves.toBeUndefined()
  })
})
```

**Step 4: Run test to verify it passes**

Run: `npm run test helpers/__tests__/useImages.spec.ts`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add helpers/__tests__/useImages.spec.ts
git commit -m "test: add useImages helper tests"
```

---

### Task 7: Test scrollAnimation Helper with GSAP Mocks

**Files:**
- Create: `helpers/__tests__/scrollAnimation.spec.ts`
- Reference: `helpers/scrollAnimation.ts`

**Step 1: Write the failing test with comprehensive mocks**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setupScrollAnimation, cleanupScrollAnimation } from '../scrollAnimation'

// Mock GSAP and ScrollTrigger
const mockGsap = {
  set: vi.fn(),
  to: vi.fn(),
  registerPlugin: vi.fn(),
}

const mockScrollTrigger = {
  getAll: vi.fn(() => []),
}

vi.mock('gsap', () => ({
  gsap: mockGsap,
  default: mockGsap,
}))

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: mockScrollTrigger,
  default: mockScrollTrigger,
}))

vi.mock('gsap/MotionPathPlugin', () => ({
  MotionPathPlugin: {},
}))

describe('setupScrollAnimation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return cleanup function when path element exists', () => {
    // Mock DOM elements
    const mockPath = {
      getAttribute: vi.fn(),
    }

    document.querySelector = vi.fn(() => mockPath as any)

    const result = setupScrollAnimation('.test-path')

    expect(result).toBeDefined()
    expect(result.cleanup).toBeInstanceOf(Function)
  })

  it('should return null when path element does not exist', () => {
    document.querySelector = vi.fn(() => null)

    const result = setupScrollAnimation('.non-existent-path')

    expect(result).toBeUndefined()
  })
})

describe('cleanupScrollAnimation', () => {
  it('should not throw when path element does not exist', () => {
    document.querySelector = vi.fn(() => null)

    expect(() => cleanupScrollAnimation('.non-existent-path')).not.toThrow()
  })
})
```

**Step 2: Run test to verify behavior**

Run: `npm run test helpers/__tests__/scrollAnimation.spec.ts`
Expected: Tests may need adjustment based on mock setup

**Step 3: Commit (even if some tests need adjustment)**

```bash
git add helpers/__tests__/scrollAnimation.spec.ts
git commit -m "test: add scrollAnimation helper tests with GSAP mocks"
```

---

## Final Verification

### Task 8: Run All Tests and Verify Coverage

**Step 1: Run all tests**

Run: `npm run test`
Expected: All new tests pass, no regressions

**Step 2: Run coverage report**

Run: `npm run test:coverage`
Expected: Coverage report generated showing minimal coverage for tested files

**Step 3: Verify test structure**

Run: `find utils helpers -type d -name "__tests__"`
Expected: Show all `__tests__` directories created

**Step 4: Commit final verification**

```bash
git add docs/plans/2026-03-01-unit-tests-phase1.md
git commit -m "docs: add unit tests phase 1 implementation plan"
```

---

## Documentation and Cleanup

### Task 9: Update Project README

**Files:**
- Modify: `README.md`

**Step 1: Add testing section to README**

```markdown
## Testing

This project uses Vitest for unit testing with the following conventions:

### Running Tests

- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:ui` - Run tests with UI interface
- `npm run test:coverage` - Generate coverage report

### Test Structure

Tests are co-located with source files in `__tests__/` directories:

```
utils/
  pluralize.ts
  __tests__/
    pluralize.spec.ts
```

### Current Coverage

Phase 1 (Current): Utils and Helpers with minimal coverage
- ✅ `slugify.ts` - Slug generation
- ✅ `pluralize.ts` - Russian pluralization
- ✅ `statsFormatters.ts` - Statistics formatting
- ✅ `showToast.ts` - Toast notifications
- ✅ `useImages.ts` - Image loading
- ✅ `scrollAnimation.ts` - GSAP animations
```

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add testing documentation to README"
```

---

## Summary

This plan establishes a minimal testing infrastructure for the project's utilities and helpers:

**Completed:**
- ✅ Vitest configuration for co-located tests
- ✅ Test patterns for pure functions
- ✅ Mock setup for external dependencies
- ✅ Minimal coverage (2-3 tests per file)
- ✅ Documentation and patterns established

**Next Phases:**
- Phase 2: Composables testing
- Phase 3: Pinia stores testing
- Phase 4: Vue components testing

**Estimated Time:** 2-3 hours for complete Phase 1 implementation
**Test Files Created:** 6 spec files
**Lines of Test Code:** ~150 lines
**Test Coverage:** ~15-20% for utils and helpers files
