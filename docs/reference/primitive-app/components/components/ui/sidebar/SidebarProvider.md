# SidebarProvider

## Props

| Prop name   | Description | Type                | Values | Default                                                                      |
| ----------- | ----------- | ------------------- | ------ | ---------------------------------------------------------------------------- |
| defaultOpen |             | boolean             | -      | !defaultDocument?.cookie.includes(<br/> `${SIDEBAR_COOKIE_NAME}=false`<br/>) |
| open        |             | boolean             | -      | undefined                                                                    |
| class       |             | TSIndexedAccessType | -      |                                                                              |

## Events

| Event name  | Properties | Description |
| ----------- | ---------- | ----------- |
| update:open |            |

## Slots

| Name    | Description | Bindings |
| ------- | ----------- | -------- |
| default |             |          |

---
