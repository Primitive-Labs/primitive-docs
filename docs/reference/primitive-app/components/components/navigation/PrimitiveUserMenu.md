# PrimitiveUserMenu

Sidebar user menu / profile summary.

When `userMenuItems` are provided, this renders a dropdown menu anchored to
the current user's avatar and name. Otherwise it renders a simple, non-menu
user summary button.

---

## Props

| Prop name     | Description                                                                 | Type    | Values | Default |
| ------------- | --------------------------------------------------------------------------- | ------- | ------ | ------- |
| currentUser   | Current signed-in user profile, or `null` when signed out / not loaded yet. | union   | -      |         |
| isOnline      | Connectivity indicator (used to render an online/offline dot).              | boolean | -      |         |
| userMenuItems | Menu items to show in the dropdown. An empty list disables the dropdown UI. | Array   | -      |         |
