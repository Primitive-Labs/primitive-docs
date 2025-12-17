# PrimitiveAppLayout

Primary application shell layout (sidebar, headers, breadcrumb, and content slot).

This layout also:

- Shows a “refresh required” banner when the Service Worker is disconnected.
- Optionally renders a mobile back bar based on navigation store state.

---

## Props

| Prop name      | Description                                                                                 | Type    | Values | Default |
| -------------- | ------------------------------------------------------------------------------------------- | ------- | ------ | ------- |
| showBreadcrumb | Whether to render the desktop breadcrumb header above the main content.<br/>`@default` true | boolean | -      | true    |

## Slots

| Name      | Description                                               | Bindings |
| --------- | --------------------------------------------------------- | -------- |
| sidebar   | Optional override for the desktop sidebar content.        |          |
| default   | Main content area. Defaults to rendering a `router-view`. |          |
| bottomNav | Optional override for the mobile bottom navigation area.  |          |
