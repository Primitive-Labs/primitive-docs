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

## State

### `badges`

Badge configurations keyed by navigation item key.

### `currentRouteName`

The name of the currently active route.

### `navigationConfig`

The complete navigation configuration provided during initialization.

### `navItems`

Static navigation items defined in configuration.

## Getters

### `navConfig`

Merged navigation configuration combining static and dynamic items.

### `navOptions`

Navigation display options.

### `allNavItems`

All navigation items as a flat record keyed by item key.

### `userMenuItems`

Items to display in the user menu dropdown.

### `navMain`

Main navigation items for the primary sidebar section.

### `navSecondary`

Secondary navigation items for the bottom of the sidebar.

### `bottomNavItems`

Navigation items formatted for the mobile bottom navigation bar.

### `currentTabKey`

The key of the currently active navigation tab.

### `canGoBackInCurrentTab`

Whether there is a previous page in the current tab's history to navigate back to.

### `currentTabBackTarget`

The route to navigate to when going back in the current tab, or null if not available.

### `getExpandedParent`

The key of the parent navigation item that should be expanded, if any.

## Actions

### `initialize`

Initialize the navigation store with router and navigation configuration.
This is typically called by `createPrimitiveApp` during app bootstrap.

| Parameter | Description |
| --- | --- |
| `options` | Router instance and navigation configuration |

### `dispose`

Clean up store resources and listeners.
Call this when unmounting the app.

### `updateNavConfig`

Update navigation items configuration with new or modified items.

| Parameter | Description |
| --- | --- |
| `updates` | Navigation items to add or update |

### `addNavItems`

Add navigation items dynamically at runtime.

| Parameter | Description |
| --- | --- |
| `items` | Navigation items to add |

### `removeNavItems`

Remove navigation items by their keys.

| Parameter | Description |
| --- | --- |
| `keys` | Array of navigation item keys to remove |

### `hideNavItems`

Hide navigation items without removing them.
Items can be shown again using `showNavItems`.

| Parameter | Description |
| --- | --- |
| `keys` | Array of navigation item keys to hide |

### `showNavItems`

Show previously hidden navigation items.

| Parameter | Description |
| --- | --- |
| `keys` | Array of navigation item keys to show |

### `clearAllDynamicNavItems`

Remove all dynamically added navigation items.

### `setBadge`

Set a badge on a navigation item.

| Parameter | Description |
| --- | --- |
| `itemKey` | The navigation item key |
| `badge` | Badge configuration (content, count, variant) |

### `clearBadge`

Remove a badge from a navigation item.

| Parameter | Description |
| --- | --- |
| `itemKey` | The navigation item key |

### `getBadge`

Get the current badge configuration for a navigation item.

| Parameter | Description |
| --- | --- |
| `itemKey` | The navigation item key |

**Returns:** Badge configuration or undefined if no badge is set

### `setCountBadge`

Set a numeric count badge on a navigation item.

| Parameter | Description |
| --- | --- |
| `itemKey` | The navigation item key |
| `count` | The count to display (badge is cleared if undefined/null) |
| `variant` | Badge color variant (default: 'orange') |

### `setDotBadge`

Set a dot indicator badge on a navigation item.

| Parameter | Description |
| --- | --- |
| `itemKey` | The navigation item key |
| `variant` | Badge color variant (default: 'red') |

### `clearAllBadges`

Remove all badges from all navigation items.

## Exported types

### NavigationInitializeOptions

```ts
export interface NavigationInitializeOptions {
  router: Router;
  navigationConfig: NavigationConfig;
}
```
