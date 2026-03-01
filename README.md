# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

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
