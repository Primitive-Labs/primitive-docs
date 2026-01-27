# PrimitiveUserTabItem

## Props

| Prop name | Description                        | Type            | Values | Default     |
| --------- | ---------------------------------- | --------------- | ------ | ----------- |
| user      | User information to display        | UserTabUserInfo | -      |             |
| isOnline  | Whether the user is online         | boolean         | -      | true        |
| menuItems | Menu items to display in the sheet | Array           | -      | () =&gt; [] |

## Events

| Event name      | Properties | Description                                                       |
| --------------- | ---------- | ----------------------------------------------------------------- |
| menu-item-click |            | Emitted when a menu item is clicked (for items without 'to' prop) |

---
