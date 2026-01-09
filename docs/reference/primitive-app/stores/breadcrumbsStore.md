# breadcrumbsStore

Pinia store for managing breadcrumb navigation.

The `useBreadcrumbsStore` automatically generates breadcrumb segments based on
the current route's matched records and their `primitiveRouterMeta.breadcrumb`
configuration.

## Features

- Automatic breadcrumb generation from route metadata
- Support for async breadcrumb generators (e.g., fetch entity name)
- Manual segment override capability
- Automatic refresh on navigation

## Usage

```ts
import { useBreadcrumbsStore } from 'primitive-app';

const breadcrumbs = useBreadcrumbsStore();

// Access current breadcrumb segments
breadcrumbs.segments.forEach(seg => {
  console.log(seg.label, seg.href);
});

// Manually refresh (e.g., after entity rename)
await breadcrumbs.refreshCurrentRoute();
```

## Route Configuration

```ts
{
  path: '/users/:id',
  meta: {
    primitiveRouterMeta: {
      breadcrumb: {
        title: 'User', // Fallback
        generator: async (params) => {
          const user = await fetchUser(params.id);
          return user.name;
        },
      },
    },
  },
}
```

## State

### `segments`

The current breadcrumb segments to display.

## Actions

### `initialize`

Wire the breadcrumbs store to a Vue Router instance.

This should be called once at app startup (for example from
`initNavigation`). Subsequent calls are ignored.

### `refreshCurrentRoute`

Re-generate breadcrumbs for the current route.

This can be called when other reactive state changes (for example,
when a user display name is updated) to refresh breadcrumb labels
without performing a navigation.

### `dispose`

Clean up the store, removing router listeners and clearing segments.
Call this when unmounting the app.

### `clear`

Clear all breadcrumb segments.

### `setSegments`

Manually set the breadcrumb segments.
Use this for custom breadcrumb overrides.

| Parameter | Description |
| --- | --- |
| `next` | Array of breadcrumb segments to display |

### `generate`

Generate breadcrumbs for a specific route.
This is called automatically on navigation.

| Parameter | Description |
| --- | --- |
| `to` | The target route to generate breadcrumbs for |

## Exported types

### BreadcrumbsInitializeOptions

```ts
export interface BreadcrumbsInitializeOptions {
  router: Router;
}
```
