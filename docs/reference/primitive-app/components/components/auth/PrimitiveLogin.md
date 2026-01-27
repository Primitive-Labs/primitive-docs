# PrimitiveLogin

Renders the Primitive login form with support for multiple authentication methods:

- Email/Magic Link authentication
- Passkey authentication (via WebAuthn Conditional UI)
- Google OAuth sign-in

This component renders just the login form content. Use it inside your own
layout (e.g., a two-column layout with marketing content).

Resolves a "continue URL" from (in order): the `continueURL` query param,
`defaultContinueUrl`, `defaultContinueRoute`, or `/`.

---

## Props

| Prop name            | Description                                                                                                                                                                                   | Type            | Values | Default |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ------ | ------- |
| appInfo              | App metadata displayed in the header (name + optional logo).                                                                                                                                  | AppInfo         | -      |         |
| links                | Optional Terms of Service / Privacy Policy links displayed under the login button.                                                                                                            | LoginLinks      | -      |         |
| defaultContinueUrl   | Default absolute/path URL to continue to after login when no `continueURL`<br/>query parameter is present.                                                                                    | string          | -      |         |
| defaultContinueRoute | Default named route to continue to after login when no `continueURL` query<br/>parameter is present. Used only if `defaultContinueUrl` is not provided.                                       | string          | -      |         |
| emailAuthMethod      | Which email authentication method to use.<br/>- `magic_link` (default): User receives a clickable link in their email<br/>- `one_time_code`: User receives a 6-digit code to enter in the app | EmailAuthMethod | -      |         |

<!-- component-types:start -->
## Types

### AppInfo

App metadata displayed in the header (name + optional logo).

| Property | Type | Description |
| --- | --- | --- |
| `name` | `string` | App name displayed above the login button. |
| `logo?` | `Component` | Optional Vue component used as the logo (takes precedence over `logoUrl`). |

```ts
/**
 * @componentType
 *
 * App metadata displayed in the header (name + optional logo).
 */
export interface AppInfo {
  /**
   * App name displayed above the login button.
   */
  name: string;
  /**
   * Optional Vue component used as the logo (takes precedence over `logoUrl`).
   */
  logo?: Component; // Vue component
  /**
   * Optional image URL to use as the logo (used if `logo` is not provided).
   */
  logoUrl?: string; // Optional image URL
}
```

### LoginLinks

Optional links shown under the login button (Terms of Service / Privacy Policy).

Provide either an absolute/path URL or a named route for each link.

| Property | Type | Description |
| --- | --- | --- |
| `termsOfServiceUrl?` | `string` | Absolute or path URL to your Terms of Service page. |
| `privacyPolicyUrl?` | `string` | Absolute or path URL to your Privacy Policy page. |
| `termsOfServiceRoute?` | `string` | Named route to your Terms of Service page (Vue Router). |
| `privacyPolicyRoute?` | `string` | Named route to your Privacy Policy page (Vue Router). |

```ts
/**
 * @componentType
 *
 * Optional links shown under the login button (Terms of Service / Privacy Policy).
 *
 * Provide either an absolute/path URL or a named route for each link.
 */
export interface LoginLinks {
  /**
   * Absolute or path URL to your Terms of Service page.
   */
  termsOfServiceUrl?: string;
  /**
   * Absolute or path URL to your Privacy Policy page.
   */
  privacyPolicyUrl?: string;
  /**
   * Named route to your Terms of Service page (Vue Router).
   */
  termsOfServiceRoute?: string;
  /**
   * Named route to your Privacy Policy page (Vue Router).
   */
  privacyPolicyRoute?: string;
}
```

<!-- component-types:end -->
