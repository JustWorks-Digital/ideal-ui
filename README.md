# Ideal

Working examples of common website UI, styled with Tailwind CSS. Each example lives in its own folder with the component, page, styles, and tests so it can be copied into another project.

## Scripts

```bash
npm run dev        # local app
npm run test       # Vitest + React Testing Library (watch)
npm run test:run   # Vitest once
npm run test:e2e   # Playwright + axe-core
npm run build
```

## Adding a component

1. Add a folder under `src/components`.
2. Put each implementation in its own variation folder (for example `basic/`) with the component, page, styles, and tests.
3. Register the component in `src/examples.ts` and the variation in that component's `variations.ts`.
4. Add routes in `src/App.tsx`.
5. Cover it with a Playwright/axe check.
