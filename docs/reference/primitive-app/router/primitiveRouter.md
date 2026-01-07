# primitiveRouter

Provides an opinionated Vue Router factory with built-in authentication guards.

The `createPrimitiveRouter` function creates a Vue Router instance that automatically
enforces authentication requirements based on route metadata. Routes can declare their
auth requirements using the `primitiveRouterMeta` property in route meta.

## Features

- **Auth Guards**: Automatically redirects unauthenticated users to login
- **Admin Routes**: Support for admin-only routes with automatic redirect
- **Breadcrumb Support**: Routes can define static or dynamic breadcrumb labels
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
          breadcrumb: { title: 'Dashboard' },
        },
      },
    },
  ],
  loginRouteName: 'login',
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

### PrimitiveRouterBreadcrumbMeta

```ts
export interface PrimitiveRouterBreadcrumbMeta {
  /**
   * Static breadcrumb label for this route.
   * Used as a fallback when no generator is provided or when it fails.
   */
  title?: string;

  /**
   * Optional generator for dynamic/async breadcrumb labels.
   *
   * Receives the route params object for the *current navigation* and
   * may return a string synchronously or a Promise<string>.
   *
   * Example:
   * ```ts
   * meta: {
   *   primitiveRouterMeta: {
   *     breadcrumb: {
   *       title: "User", // fallback
   *       generator: async (params) => {
   *         const user = await fetchUser(params.id as string);
   *         return `User: ${user.name}`;
   *       },
   *     },
   *   },
   * }
   * ```
   */
  generator?: (params: Record<string, unknown>) => string | Promise<string>;
}
```

### PrimitiveRouterMeta

```ts
/**
 * Shared route metadata used by primitive-app and consumer apps.
 * Extend this over time as we add more cross-app route meta fields.
 */
export interface PrimitiveRouterMeta {
  /**
   * Required authorization level for this route.
   * Defaults to "none" when omitted.
   */
  requireAuth: AuthLevel;

  /**
   * Optional breadcrumb configuration used by primitive-app navigation.
   */
  breadcrumb?: PrimitiveRouterBreadcrumbMeta;
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
}
```
