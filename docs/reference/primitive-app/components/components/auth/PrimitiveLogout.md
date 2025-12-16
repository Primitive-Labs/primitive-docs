# PrimitiveLogout

## Props

| Prop name        | Description                                                                                                                                                                                                                                                     | Type      | Values | Default |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------ | ------- |
| continueURL      | Absolute or path URL to redirect to after logout.<br/><br/>Exactly one of `continueURL` or `continueRoute` must be provided.<br/>If neither is provided, the component will throw at runtime to<br/>force the caller to explicitly choose a logout destination. | string    | -      |         |
| continueRoute    | Named route to resolve and redirect to after logout.<br/><br/>Exactly one of `continueURL` or `continueRoute` must be provided.                                                                                                                                 | string    | -      |         |
| loadingComponent | Optional loading component to display while logout is in progress.<br/>Defaults to `PrimitiveLogoSpinner` when not provided.                                                                                                                                    | Component | -      |         |

---
