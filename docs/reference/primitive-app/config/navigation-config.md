# Navigation config (`navigationConfig`)

Primitive App’s navigation is configured via `createPrimitiveApp({ getNavigationConfig })`.

- **Type**: [`NavigationConfig`](/reference/primitive-app/types/symbols/NavigationConfig)
- **Source**: `packages/primitive-app/src/types/navigation.ts`

## Shape

At a high level:

- **`navItems` (required)**: a record of navigation items keyed by an id you choose.
- **`navOptions` (optional)**: global behavior knobs (mobile overflow, bottom-nav enablement, etc).

## `navOptions`

Defined by [`NavigationOptions`](/reference/primitive-app/types/symbols/NavigationOptions):

- **`overflowMode`**: controls mobile bottom-nav overflow behavior.
  - See [`NavigationOverflowMode`](/reference/primitive-app/types/symbols/NavigationOverflowMode)
- **`maxVisibleTabs`**: soft cap for bottom tabs before reserving a slot for overflow (defaults to 5).
- **`mobileNavEnabled`**: enables/disables mobile navigation chrome (defaults to true).
- **`mobileBackEnabled`**: enables/disables the mobile back header (defaults to `mobileNavEnabled`).

## `navItems`

`navItems` is a `Record<string, NavItemConfig>`.

Each [`NavItemConfig`](/reference/primitive-app/types/symbols/NavItemConfig) supports:

- **Identity & grouping**
  - **`key`**: optional stable identifier; if omitted, the `navItems` record key is used.
  - **`navTitle`**: label shown in navigation.
  - **`navGroup`**: `"main" | "secondary" | "user-menu"` placement.
  - **`parentKey`**: optional parent item key (for nesting).
  - **`navHeader`**: optional header label for grouped sections.
- **Routing**
  - **`routeName`** / **`routeParams`**: for internal vue-router navigation.
  - **`matchRouteNames`**: treat additional route names as “belonging to” this item (active/expanded state).
  - **`externalHref`** / **`target`**: for external links.
- **Visibility & mobile**
  - **`hidden`**: hide an item from nav UI.
  - **`mobilePriority`**: controls inclusion and ordering in the mobile bottom nav.
- **Rendering**
  - **`icon`**: a Vue `Component` used as the item icon.

## Minimal example

```ts
import type { NavigationConfig } from "@primitive-app/primitive-app";

export const getNavigationConfig = (): NavigationConfig => ({
  navItems: {
    home: {
      navTitle: "Home",
      navGroup: "main",
      routeName: "home",
    },
    docs: {
      navTitle: "Docs",
      navGroup: "main",
      externalHref: "https://example.com/docs",
      target: "_blank",
      mobilePriority: 2,
    },
  },
  navOptions: {
    overflowMode: "auto",
    maxVisibleTabs: 5,
  },
});
```


