# PrimitiveLogout

Logs the current user out, then redirects to the configured destination.

This component is intentionally “headless”: it performs the logout side-effect
on mount and renders only a loading indicator while the request is in flight.

---

## Props

| Prop name        | Description                                                                                                                                                                                                                                                     | Type      | Values | Default |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------ | ------- |
| continueURL      | Absolute or path URL to redirect to after logout.<br/><br/>Exactly one of `continueURL` or `continueRoute` must be provided.<br/>If neither is provided, the component will throw at runtime to<br/>force the caller to explicitly choose a logout destination. | string    | -      |         |
| continueRoute    | Named route to resolve and redirect to after logout.<br/><br/>Exactly one of `continueURL` or `continueRoute` must be provided.                                                                                                                                 | string    | -      |         |
| loadingComponent | Optional loading component to display while logout is in progress.<br/>Defaults to `PrimitiveLogoSpinner` when not provided.                                                                                                                                    | Component | -      |         |
