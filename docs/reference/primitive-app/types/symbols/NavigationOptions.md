# NavigationOptions

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
