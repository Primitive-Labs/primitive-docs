# PrimitiveUserMenu

Sidebar user menu / profile summary.

When `userMenuItems` are provided, this renders a dropdown menu anchored to
the current user's avatar and name. Otherwise it renders a simple, non-menu
user summary button.

On mobile (when `mobile` prop is true), a bottom sheet is used instead of
a dropdown to avoid clipping issues in narrow viewports.

Items with an `action` property emit a `menu-action` event instead of navigating.

---

## Props

| Prop name     | Description                                                                 | Type    | Values | Default |
| ------------- | --------------------------------------------------------------------------- | ------- | ------ | ------- |
| currentUser   | Current signed-in user profile, or `null` when signed out / not loaded yet. | union   | -      |         |
| isOnline      | Connectivity indicator (used to render an online/offline dot).              | boolean | -      |         |
| userMenuItems | Menu items to show in the dropdown. An empty list disables the dropdown UI. | Array   | -      |         |
| mobile        | When true, renders a mobile-friendly bottom sheet instead of a dropdown.    | boolean | -      |         |

## Events

| Event name  | Properties | Description                                                    |
| ----------- | ---------- | -------------------------------------------------------------- |
| menu-action |            | Emitted when a menu item with an `action` property is clicked. |
