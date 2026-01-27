# PrimitiveUserMenu

## Props

| Prop name | Description                                             | Type             | Values | Default     |
| --------- | ------------------------------------------------------- | ---------------- | ------ | ----------- |
| user      | User information to display                             | UserMenuUserInfo | -      |             |
| isOnline  | Whether the user is online                              | boolean          | -      | true        |
| menuItems | Menu items to display in the dropdown                   | Array            | -      | () =&gt; [] |
| menuSide  | Side to display the dropdown menu (for sidebar context) | union            | -      | "right"     |

## Events

| Event name      | Properties | Description                                                       |
| --------------- | ---------- | ----------------------------------------------------------------- |
| menu-item-click |            | Emitted when a menu item is clicked (for items without 'to' prop) |

---
