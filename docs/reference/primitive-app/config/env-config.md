# Env config (`envConfig`)

Primitive App is designed so **consumer apps control configuration**, rather than the library directly reading lots of environment variables.

That said, Primitive App does interact with a small set of environment variables via Vite’s `import.meta.env` typing (`ImportMetaEnv`).

- **Type source**: `packages/primitive-app/env.d.ts`

## `VITE_LOG_LEVEL`

- **Type**: `string | undefined`
- **Purpose**: suggested convention for consumer apps to decide a log level.
- **Notes**: Primitive App’s logger does **not** read this automatically; your app can read `import.meta.env.VITE_LOG_LEVEL` and pass a derived `LogLevel` into `createPrimitiveApp({ getLogLevel })` (or directly into `createLogger({ level })`).

## `VITE_WORKTREE_LABEL`

- **Type**: `string | undefined`
- **Purpose**: optional label shown in the UI (intended for local/dev worktrees).
- **Where used**: `PrimitiveAppLayout` reads it from `import.meta.env`.


