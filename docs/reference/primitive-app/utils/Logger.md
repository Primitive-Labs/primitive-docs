# Logger

Primitive App ships with a small, dependency-free logger that:

- supports log levels (`"debug" | "info" | "warn" | "error" | "none"`)
- supports scoped prefixes (e.g. `[PrimitiveApp:PrimitiveLogin]`)
- can be controlled globally via `createPrimitiveApp({ getLogLevel })`

## Import

```ts
import { primitiveAppBaseLogger } from "primitive-app";
```

You can also create your own independent logger (not connected to Primitive App’s global logger):

```ts
import { createLogger } from "primitive-app";
```

## Primitive App logger (`primitiveAppBaseLogger`)

`primitiveAppBaseLogger` is a shared logger instance already scoped to `"PrimitiveApp"`. Derive a per-module/per-component logger using `forScope()`:

```ts
import { primitiveAppBaseLogger } from "primitive-app";

const logger = primitiveAppBaseLogger.forScope("PrimitiveLogin");

logger.debug("Starting login", { continueUrl });
logger.error("Login failed", { error });
```

### Scopes and output format

Scopes are rendered as a console prefix:

- `primitiveAppBaseLogger.forScope("A").forScope("B")` prints with prefix `[PrimitiveApp:A:B]`

### Global level control (recommended)

Primitive App does **not** read environment variables directly. Instead, set the library-wide level when bootstrapping:

```ts
import { createPrimitiveApp, type LogLevel } from "primitive-app";

await createPrimitiveApp({
  // ... other required bootstrap options ...
  getLogLevel: () => (import.meta.env.DEV ? ("debug" satisfies LogLevel) : "warn"),
});
```

This sets `primitiveAppBaseLogger.level`, and affects **all** scope loggers derived from it.

## Levels

The logger acts like a typical “minimum severity” threshold:

- `"debug"`: logs everything
- `"info"`: logs info/warn/error
- `"warn"`: logs warn/error (**default**)
- `"error"`: logs only error
- `"none"`: logs nothing

## API notes

- `logger.debug(...args)`: logs at `"debug"` (uses `console.debug`)
- `logger.log(...args)`: logs at `"info"` (uses `console.log`)
- `logger.warn(...args)`: logs at `"warn"` (uses `console.warn`)
- `logger.error(...args)`: logs at `"error"` (uses `console.error`)
- `logger.forScope(scope)`: returns a new logger with an extra scope segment (shared level controller for `primitiveAppBaseLogger`)
- `logger.level` / `logger.setLevel(level)`: set the current threshold (`"none"` disables output)
- `logger.shouldLog(level)`: check whether a given level would be emitted

## Creating an independent logger (`createLogger`)

If you want a logger that is **not** tied to Primitive App’s global level, create your own:

```ts
import { createLogger } from "primitive-app";

const logger = createLogger({ level: "info", scope: ["MyApp", "FeatureX"] });
logger.log("Hello");
```

This logger’s level changes do **not** affect `primitiveAppBaseLogger` (and vice versa).


