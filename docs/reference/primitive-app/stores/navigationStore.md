# navigationStore

Pinia store for managing application navigation state.

The `useNavigationStore` provides:
- Sidebar navigation items (main and secondary groups)
- Mobile bottom navigation with tab-based history
- User menu items
- Dynamic navigation updates (add, remove, hide, show items)
- Badge management for navigation items

## Usage

```ts
import { useNavigationStore } from 'primitive-app';

const navStore = useNavigationStore();

// Access navigation items
const mainItems = navStore.navMain;
const bottomItems = navStore.bottomNavItems;

// Set a badge on a nav item
navStore.setCountBadge('notifications', 5, 'red');

// Dynamically add navigation items
navStore.addNavItems({
  settings: {
    routeName: 'settings',
    navTitle: 'Settings',
    navGroup: 'secondary',
    icon: SettingsIcon,
  },
});
```

## Configuration

Navigation is configured via `NavigationConfig` passed to `createPrimitiveApp`.
See the config documentation for details on defining navigation items.

## Exported types

### NavigationInitializeOptions

```ts
export interface NavigationInitializeOptions {
  router: Router;
  navigationConfig: NavigationConfig;
}
```
