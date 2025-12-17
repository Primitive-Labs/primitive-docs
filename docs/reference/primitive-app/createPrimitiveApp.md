# createPrimitiveApp

`createPrimitiveApp()` is `primitive-app`’s opinionated bootstrap helper for wiring a **Vue 3 + Pinia + vue-router** app into **js-bao-wss-client** plus the shared `primitive-app` stores.

It’s exported from `primitive-app`’s entrypoint (so you can `import { createPrimitiveApp } from "primitive-app"`), and implemented in `packages/primitive-app/src/createPrimitiveApp.ts`.

## What it does

At a high level, `createPrimitiveApp()`:

- Applies an optional global log level override (`getLogLevel`)
- Creates the Vue app and installs Pinia
- Initializes js-bao client configuration (`getJsBaoConfig`) and the user/auth store (using `loginUrl`)
- Initializes the app config store (`getAppConfig`)
- Wires document-store behavior based on `documentStoreMode` (single-document, multi-doc, or none)
- Sets up page title syncing using breadcrumbs + router (when running in the browser)
- Mounts the app (defaults to `"#app"`)

## Signature

```ts
export async function createPrimitiveApp(
  options: PrimitiveAppBootstrapOptions
): Promise<PrimitiveAppBootstrapResult>
```

## Options (`PrimitiveAppBootstrapOptions`)

- **Required**
  - `mainComponent`: your root Vue component (often `App.vue`)
  - `router`: your `vue-router` instance
  - `getAppConfig`: returns `InitializeAppConfigOptions` for the app config store
  - `getJsBaoConfig`: returns js-bao-wss-client configuration (passed to `initializeJsBao`)
  - `loginUrl`: route path used by auth flows (commonly `"/login"`)
- **Optional**
  - `getNavigationConfig`: initializes the navigation store for the main app area
  - `getSingleDocumentConfig`: required when `documentStoreMode` is `SingleDocument` or `SingleDocumentWithSwitching`
  - `getLogLevel`: overrides the internal logger’s default level
  - `mountTarget`: CSS selector or element (defaults to `"#app"`)

## Document store modes

The document-store wiring is controlled by `documentStoreMode` from `getAppConfig()`:

- `DocumentStoreMode.None`: no document stores are initialized
- `DocumentStoreMode.SingleDocument` / `DocumentStoreMode.SingleDocumentWithSwitching`:
  - requires `getSingleDocumentConfig`
  - initializes `jsBaoDocumentsStore` and then `singleDocumentStore` on authentication
  - resets them on logout
- `DocumentStoreMode.MultiDoc`:
  - initializes `jsBaoDocumentsStore` on authentication
  - resets it (and `multiDocumentStore`) on logout
  - collections are registered dynamically by the app via `multiDocumentStore.registerCollection(...)`

## Example

```ts
// src/main.ts
import { createPrimitiveApp } from "primitive-app";
import App from "./App.vue";
import router from "./router/routes";
import { getAppConfig, getSingleDocumentConfig } from "./config/appConfig";
import { getJsBaoConfig, getLogLevel } from "./config/envConfig";
import { getNavigationConfig } from "./config/navigationConfig";

void createPrimitiveApp({
  mainComponent: App,
  router,
  getAppConfig,
  getJsBaoConfig,
  getNavigationConfig,
  getSingleDocumentConfig,
  loginUrl: "/login",
  getLogLevel,
});
```

## Related reference pages

- [`useJsBaoDataLoader`](/reference/primitive-app/composables/useJsBaoDataLoader)
- [`useTheme`](/reference/primitive-app/composables/useTheme)

