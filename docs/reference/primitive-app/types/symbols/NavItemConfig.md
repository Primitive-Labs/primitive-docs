# NavItemConfig

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
   * Either routeName or externalHref should be provided.
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
   * Either externalHref or routeName should be provided.
   */
  externalHref?: string;
  /**
   * Target for external links. Ignored for internal route-based items.
   */
  target?: "_self" | "_blank";
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
