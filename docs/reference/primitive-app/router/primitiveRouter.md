# primitiveRouter

Provides an opinionated Vue Router factory with built-in authentication guards.

The `createPrimitiveRouter` function creates a Vue Router instance that automatically
enforces authentication requirements based on route metadata. Routes can declare their
auth requirements using the `primitiveRouterMeta` property in route meta.

## Features

- **Auth Guards**: Automatically redirects unauthenticated users to login
- **Admin Routes**: Support for admin-only routes with automatic redirect
- **Login Redirect**: Configurable login route or external URL with continue URL support

## Usage

```ts
import { createPrimitiveRouter } from 'primitive-app';

const router = createPrimitiveRouter({
  routes: [
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: {
        primitiveRouterMeta: {
          requireAuth: 'member',
        },
      },
    },
  ],
  loginRouteName: 'login',
  homeRouteName: 'home', // for admin redirect fallback
});
```

## Exported types

### AuthLevel

```ts
/**
 * Authorization level required for a route.
 *
 * - "none": route is public
 * - "member": authenticated user required
 * - "admin": authenticated user with admin privileges required
 */
export type AuthLevel = "member" | "admin" | "none";
```

### PrimitiveRouterMeta

```ts
/**
 * Shared route metadata used by primitive-app and consumer apps.
 */
export interface PrimitiveRouterMeta {
  /**
   * Required authorization level for this route.
   * Defaults to "none" when omitted.
   */
  requireAuth: AuthLevel;
}
```

### CreatePrimitiveRouterOptions

```ts
export interface CreatePrimitiveRouterOptions {
  /**
   * The routes to install into the underlying Vue Router instance.
   */
  routes: RouteRecordRaw[];

  /**
   * Optional custom history implementation. Defaults to
   * `createWebHistory(BASE_URL || "/")` when omitted.
   */
  history?: RouterHistory;
  /**
   * External URL to redirect unauthenticated users to.
   *
   * When provided, unauthenticated users will be redirected to this URL
   * with a `continueURL` query parameter pointing back to the original
   * destination.
   */
  loginUrl?: string;

  /**
   * Named login route to redirect unauthenticated users to.
   *
   * When provided, unauthenticated users will be redirected to this
   * route name with a `continueURL` query parameter in the querystring.
   */
  loginRouteName?: string;

  /**
   * Named home route to redirect non-admin users to when they attempt
   * to access an admin-only route.
   *
   * When omitted, defaults to "home".
   */
  homeRouteName?: string;
}
```
