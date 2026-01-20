# navigation

## Exported types

### BreadcrumbSegment

```ts
export interface BreadcrumbSegment {
  label: string;
  href: string;
}
```

### BadgeVariant

```ts
export type BadgeVariant =
  | "gray"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "indigo"
  | "violet";
```

### BadgeConfig

```ts
export interface BadgeConfig {
  content?: string;
  count?: number;
  variant?: BadgeVariant;
}
```

### NavigationOverflowMode

```ts
export enum NavigationOverflowMode {
  Auto = "auto",
  Always = "always",
  Never = "never",
}
```

### NavigationOptions

```ts
/**
 * Global navigation and mobile behavior options.
 */
export interface NavigationOptions {
  /**
   * Mobile bottom-nav overflow behavior.
   */
  overflowMode?: NavigationOverflowMode;

  /**
   * Soft cap on how many bottom tabs are visible before reserving a slot
   * for the overflow trigger. Defaults to 5 when omitted.
   */
  maxVisibleTabs?: number;

  /**
   * Whether mobile-specific navigation chrome (bottom tabs and related
   * behavior) is enabled. Defaults to true when omitted.
   */
  mobileNavEnabled?: boolean;

  /**
   * Whether the mobile back header is enabled. Defaults to the value of
   * mobileNavEnabled when omitted.
   */
  mobileBackEnabled?: boolean;
}
```

### NavItemConfig

```ts
export interface NavItemConfig {
  /**
   * Optional stable identifier for this item.
   * When omitted, the key from the containing NavigationConfig record is used.
   */
  key?: string;
  icon?: Component;
  navTitle: string;
  navGroup: "main" | "secondary" | "user-menu";
  /**
   * Optional key of the parent item in the NavigationConfig.
   */
  parentKey?: string;
  navHeader?: string;
  /**
   * Named vue-router route for internal navigation.
   * Either routeName, externalHref, or action should be provided.
   */
  routeName?: string;
  routeParams?: Record<string, string>;
  /**
   * Additional vue-router route names that should be treated as belonging
   * to this nav item for purposes of "active" and "expanded" state.
   *
   * This is especially useful for dynamic/detail routes (for example,
   * `getting-started-routing-slug`) that conceptually live under a main
   * nav item but should not appear as separate entries in the sidebar.
   */
  matchRouteNames?: string[];
  /**
   * External URL for items that should link outside the app shell.
   * Either routeName, externalHref, or action should be provided.
   */
  externalHref?: string;
  /**
   * Target for external links. Ignored for internal route-based items.
   */
  target?: "_self" | "_blank";
  /**
   * Custom action identifier for items that trigger behavior rather than
   * navigation. When provided, clicking the item emits an event with this
   * action name instead of navigating.
   * Either routeName, externalHref, or action should be provided.
   */
  action?: string;
  /**
   * Vue component to render when this action is triggered.
   * When provided alongside `action`, PrimitiveAppLayout will automatically
   * render this component as a dialog/modal when the action is activated.
   * The component receives `open` (boolean) and emits `update:open` for closing.
   */
  actionComponent?: Component;
  hidden?: boolean;
  /**
   * Optional priority for inclusion in the mobile bottom navigation.
   *
   * - Lower numbers are shown first (1 is highest priority).
   * - When at least one item has a mobilePriority, only items with
   *   this field defined are considered for the bottom nav.
   * - When no items define mobilePriority, the bottom nav falls
   *   back to the original navigation order.
   */
  mobilePriority?: number;
}
```

### NavigationItemsConfig

```ts
export type NavigationItemsConfig = Record<string, NavItemConfig>;
```

### NavigationConfig

```ts
/**
 * High-level navigation configuration combining global options and
 * item-level configuration.
 */
export interface NavigationConfig {
  navOptions?: NavigationOptions;
  navItems: NavigationItemsConfig;
}
```

### NavItemImpl

```ts
export interface NavItemImpl {
  title: string;
  url: string;
  icon?: Component;
  isGroupHeader?: boolean;
  /**
   * Indicates this item should be rendered as an external link.
   * When true, url is expected to be an absolute or external URL.
   */
  isExternal?: boolean;
  /**
   * Target for the link. Defaults to "_self" when not provided.
   */
  target?: "_self" | "_blank";
  items?: {
    key?: string;
    title: string;
    url: string;
    isExternal?: boolean;
    target?: "_self" | "_blank";
  }[];
}
```

### BottomNavItem

```ts
export interface BottomNavItem {
  /**
   * Stable key for this item, derived from the NavigationConfig key.
   */
  key: string;
  title: string;
  url: string;
  icon?: Component;
  /**
   * Indicates this item should be rendered as an external link.
   */
  isExternal?: boolean;
  /**
   * Target for the link. Defaults to "_self" when not provided.
   */
  target?: "_self" | "_blank";
  /**
   * Optional priority copied from NavItemConfig.mobilePriority.
   */
  mobilePriority?: number;
}
```
