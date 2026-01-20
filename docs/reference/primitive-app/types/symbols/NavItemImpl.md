# NavItemImpl

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
