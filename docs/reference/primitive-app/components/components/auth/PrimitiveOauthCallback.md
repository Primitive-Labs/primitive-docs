# PrimitiveOauthCallback

Handles the OAuth callback redirect flow and navigates to the appropriate page.

On mount, this component parses the current URL, calls the user store to
complete OAuth, then redirects to a resolved continue URL (or back to login
with an error message on failure).

---

## Props

| Prop name        | Description                                                                                                                        | Type      | Values | Default |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------- | ------ | ------- |
| continueURL      | Absolute/path URL to continue to after successful OAuth callback.<br/>Either `continueURL` or `continueRoute` must be provided.    | string    | -      |         |
| continueRoute    | Named route to continue to after successful OAuth callback.<br/>Either `continueURL` or `continueRoute` must be provided.          | string    | -      |         |
| loginUrl         | Absolute/path login URL used when redirecting on error.<br/>Either `loginUrl` or `loginRoute` must be provided.                    | string    | -      |         |
| loginRoute       | Named login route used when redirecting on error.<br/>Either `loginUrl` or `loginRoute` must be provided.                          | string    | -      |         |
| loadingComponent | Optional loading component to display while handling the OAuth callback.<br/>Defaults to `PrimitiveLogoSpinner` when not provided. | Component | -      |         |
