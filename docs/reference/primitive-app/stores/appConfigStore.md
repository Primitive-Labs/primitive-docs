# appConfigStore

Pinia store for application-wide configuration.

The `useAppConfigStore` holds configuration values set during app initialization.
These values are typically set via `createPrimitiveApp` and used by layouts
and components throughout the app.

## Stored Configuration

- `appName`: Display name for the application
- `appIcon`: Icon component for branding
- `homeRouteName`: Route to navigate to for "home"
- `loginRouteName`: Route for the login page
- `documentStoreMode`: Which document store mode is active
- `loadingComponent`: Component to show during loading states
- `pageTitleFormatter`: Custom function for formatting page titles

## Usage

```ts
import { useAppConfigStore } from 'primitive-app';

const appConfig = useAppConfigStore();

// Access config values
console.log('App name:', appConfig.appName());
console.log('Document mode:', appConfig.documentStoreMode());
```

## State

### `state`

## Getters

### `appName`

Get the application display name.

### `appIcon`

Get the application icon component.

### `homeRouteName`

Get the route name for the home/landing page.

### `loginRouteName`

Get the route name for the login page.

### `loadingComponent`

Get the component to display during loading states.

### `documentStoreMode`

Get the active document store mode ('single', 'singleWithSwitching', or 'multi').

### `pageTitleFormatter`

Get the custom page title formatter function, if configured.

## Actions

### `initialize`

Initialize the app configuration store with the provided options.
This is typically called by `createPrimitiveApp` during app bootstrap.

| Parameter | Description |
| --- | --- |
| `options` | Configuration options for the application |

## Exported types

### InitializeAppConfigOptions

```ts
export interface InitializeAppConfigOptions {
  appName: string;
  appIcon: Component;
  homeRouteName: RouteRecordName;
  loginRouteName: RouteRecordName;
  /**
   * Optional formatter used to derive the page title from the current
   * breadcrumb label, app name, and active route.
   *
   * When omitted, primitive-app will default to:
   *   - "Breadcrumb : AppName" when a breadcrumb label is available
   *   - "AppName" when no breadcrumb label is available
   */
  pageTitleFormatter?: (input: {
    breadcrumb: string | null;
    appName: string;
    route: RouteLocationNormalizedLoaded;
  }) => string;
  /**
   * Controls which document store mode primitive-app should use. This value
   * is consumed by createPrimitiveApp during bootstrap and is also exposed
   * via the appConfig store so layouts and components can adjust their UI.
   */
  documentStoreMode: DocumentStoreMode;
  loadingComponent?: Component;
}
```
