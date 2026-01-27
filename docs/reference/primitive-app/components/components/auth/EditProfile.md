# EditProfile

Edit profile dialog/sheet component.

Allows users to edit their name and avatar.
Uses a dialog on larger screens and adapts to a full-width sheet on mobile.

---

## Props

| Prop name     | Description                    | Type          | Values | Default                                                                                                                  |
| ------------- | ------------------------------ | ------------- | ------ | ------------------------------------------------------------------------------------------------------------------------ |
| open          | Whether the dialog is open.    | boolean       | -      | false                                                                                                                    |
| profileConfig | Profile editing configuration. | ProfileConfig | -      | () =&gt; ({<br/> requestName: true,<br/> requireName: false,<br/> requestAvatar: true,<br/> requireAvatar: false,<br/>}) |

## Events

| Event name  | Properties | Description |
| ----------- | ---------- | ----------- |
| update:open |            |
