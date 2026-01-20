# PrimitiveOauthCallback

Handles the OAuth and magic link callback redirect flows.

On mount, this component:

1. Detects callback type (OAuth code+state or magic_token)
2. Completes authentication via the user store
3. Optionally prompts for profile completion (name) if user profile is incomplete
4. Optionally prompts to add a passkey if user has none and passkeys are enabled
5. Redirects to the appropriate page on success or back to login on failure

---

## Props

| Prop name        | Description                                                                                                                        | Type      | Values | Default   |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------- | ------ | --------- |
| continueURL      | Absolute/path URL to continue to after successful OAuth callback.<br/>Either `continueURL` or `continueRoute` must be provided.    | string    | -      |           |
| continueRoute    | Named route to continue to after successful OAuth callback.<br/>Either `continueURL` or `continueRoute` must be provided.          | string    | -      |           |
| loginUrl         | Absolute/path login URL used when redirecting on error.<br/>Either `loginUrl` or `loginRoute` must be provided.                    | string    | -      |           |
| loginRoute       | Named login route used when redirecting on error.<br/>Either `loginUrl` or `loginRoute` must be provided.                          | string    | -      |           |
| loadingComponent | Optional loading component to display while handling the OAuth callback.<br/>Defaults to `PrimitiveLogoSpinner` when not provided. | Component | -      |           |
| requestName      | Whether to show the name field if user.name is blank.<br/>Defaults to appConfig.profileConfig().requestName                        | boolean   | -      | undefined |
| requireName      | Whether name is required before continuing.<br/>Defaults to appConfig.profileConfig().requireName                                  | boolean   | -      | undefined |
| requestAvatar    | Whether to show the avatar field if user.avatarUrl is blank.<br/>Defaults to appConfig.profileConfig().requestAvatar               | boolean   | -      | undefined |
| requireAvatar    | Whether avatar is required before continuing.<br/>Defaults to appConfig.profileConfig().requireAvatar                              | boolean   | -      | undefined |
| promptForPasskey | Whether to prompt user to add a passkey if they have none.<br/>`@default` true                                                     | boolean   | -      | true      |
