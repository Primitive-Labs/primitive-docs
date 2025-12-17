# App config (`appConfig`)

Primitive App’s app-level configuration is provided via `createPrimitiveApp({ getAppConfig })`.

- **Type**: `InitializeAppConfigOptions` (exported from `primitive-app`)
- **Source**: `packages/primitive-app/src/stores/appConfigStore.ts`

This config primarily drives the app shell (name/icon), routing defaults, page title behavior, and document store mode.

## Options

- **`appName`** *(required)*: display name used in headers and (by default) the page title.
- **`appIcon`** *(required)*: Vue component for the application icon.
- **`homeRouteName`** *(required)*: vue-router route name to treat as “home”.
- **`loginRouteName`** *(required)*: vue-router route name for the login page.
- **`documentStoreMode`** *(required)*: which document store mode to use.
  - See [`DocumentStoreMode`](/reference/primitive-app/types/symbols/DocumentStoreMode)
- **`loadingComponent`** *(optional)*: component to render for loading/skeleton states.
- **`pageTitleFormatter`** *(optional)*: derive `document.title` from breadcrumb/app/route.
  - When omitted, Primitive App defaults to:
    - `"Breadcrumb : AppName"` when a breadcrumb label is available
    - `"AppName"` when no breadcrumb label is available

## Example

```ts
import type { InitializeAppConfigOptions } from "@primitive-app/primitive-app";
import AppIcon from "@/components/AppIcon.vue";

export const getAppConfig = (): InitializeAppConfigOptions => ({
  appName: "My App",
  appIcon: AppIcon,
  homeRouteName: "home",
  loginRouteName: "login",
  documentStoreMode: "single-document-with-switching",
  pageTitleFormatter: ({ breadcrumb, appName }) =>
    breadcrumb ? `${breadcrumb} · ${appName}` : appName,
});
```


