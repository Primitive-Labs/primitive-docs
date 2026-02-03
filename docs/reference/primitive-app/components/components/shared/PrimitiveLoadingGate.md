# PrimitiveLoadingGate

Conditional rendering gate that delays showing a loading indicator until a configurable timeout.

This prevents "flash of loading indicator" for fast loads: during the initial delay it
renders nothing, then shows the loading slot if still loading, otherwise
renders the default slot when ready.

Can be used with any loading indicator (skeletons, spinners, etc.) - the loading slot
accepts any content you want to display while waiting.

---

## Props

| Prop name | Description                                                                    | Type    | Values | Default |
| --------- | ------------------------------------------------------------------------------ | ------- | ------ | ------- |
| isReady   | When true, renders the default slot. When false, begins the loading/gate flow. | boolean | -      |         |
| delayMs   | Milliseconds to wait before rendering the `loading` slot.<br/>`@default` 50    | number  | -      | 50      |

## Slots

| Name    | Description                                                                                                                                  | Bindings |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| loading | Loading indicator content to render after `delayMs` while loading.<br/>Can be a skeleton, spinner, or any other loading state visualization. |          |
| default | Content to render when `isReady` is true.                                                                                                    |          |
