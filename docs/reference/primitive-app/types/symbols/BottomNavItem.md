# BottomNavItem

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
