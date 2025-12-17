# useTheme

Theme helper composable for applying global theme and dark mode classes.

This composable mutates the `<html>` element's class list (e.g. `theme-foo`,
`dark`) and provides small utilities to bind reactive state to those classes.

## Exported types

### SetThemeClassOptions

```ts
export interface SetThemeClassOptions {
  /**
   * Prefix used to identify existing theme classes on <html>. Any class that
   * starts with this prefix will be removed before applying the new one.
   *
   * Defaults to "theme-".
   */
  prefix?: string;
}
```

### ClearThemeOptions

```ts
export interface ClearThemeOptions {
  /**
   * Prefix used to identify theme classes to remove. Defaults to "theme-".
   */
  prefix?: string;
  /**
   * Whether to also remove the "dark" class. Defaults to true.
   */
  clearDarkMode?: boolean;
}
```
