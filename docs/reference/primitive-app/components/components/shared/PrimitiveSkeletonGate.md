# PrimitiveSkeletonGate

Conditional rendering gate that delays showing a skeleton until a short timeout.

This prevents “flash of skeleton” for fast loads: during the initial delay it
renders nothing, then shows the `skeleton` slot if still loading, otherwise
renders the default slot when ready.

---

## Props

| Prop name | Description                                                                        | Type    | Values | Default |
| --------- | ---------------------------------------------------------------------------------- | ------- | ------ | ------- |
| isReady   | When true, renders the default slot. When false, begins the loading/skeleton flow. | boolean | -      |         |
| delayMs   | Milliseconds to wait before rendering the `skeleton` slot.<br/>`@default` 200      | number  | -      | 200     |

## Slots

| Name     | Description                                                           | Bindings |
| -------- | --------------------------------------------------------------------- | -------- |
| skeleton | Skeleton placeholder content to render after `delayMs` while loading. |          |
| default  | Content to render when `isReady` is true.                             |          |
