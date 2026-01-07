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

## Exported types

### BreadcrumbsInitializeOptions

```ts
export interface BreadcrumbsInitializeOptions {
  router: Router;
}
```
