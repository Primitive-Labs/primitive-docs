# Authentication

The starter templates — web (Vue) and iOS (SwiftUI) — come with a complete authentication flow out of the box: login UI, token management, session handling, and multiple sign-in methods. You don't need to build auth screens or wire up the client yourself. Not using a template? Every flow is also available directly on the client — see [Using the Client Directly](#using-the-client-directly).

The two things you may want to configure are:

1. **Email sign-in method** — Magic Link or One-Time Password
2. **Google OAuth** — Optional, requires setting up a Google OAuth client

## Server App Settings Must Match Your App's Origin

Authentication runs against server-side **app settings** that must line up with where your client app is actually served. Three settings matter, and a mismatch in the first one fails in a particularly confusing way:

| Setting | What it does | How to set |
|---|---|---|
| **CORS allowed origins** | The whitelist of origins allowed to call the Primitive API from a browser. Your serving origin (scheme + host + port) must be listed. | `primitive apps update --cors-origins "http://localhost:5173,https://myapp.com"` or Admin Console |
| **Redirect URIs** | The whitelist of OAuth callback URLs. The callback your app uses must match exactly, or the OAuth callback fails with `Invalid redirect URI`. | Admin Console (no CLI flag) |
| **Base URL** | Where the app is served — used for links in auth emails and redirects. | `primitive apps update --base-url "https://myapp.com"` |

Inspect all three anytime with `primitive apps get`.

## The Template Login

Both starter templates ship a drop-in login flow:

::: code-group

```vue [Web (Vue)]
<PrimitiveLogin
  appName="My App"
  defaultContinueRoute="home"
  emailAuthMethod="one_time_code"
/>
```

```swift [iOS (SwiftUI)]
// AuthGateView shows PrimitiveLoginView until the user is signed in
// and connected, then renders your content.
AuthGateView(
  appState: appState,
  appName: "My App",
  authManager: appState.authManager
) {
  MainTabView()
}
```

:::

| | Web (Vue) | iOS (SwiftUI) |
|---|---|---|
| Component | `PrimitiveLogin` | `PrimitiveLoginView`, wrapped by `AuthGateView` |
| Email sign-in | `emailAuthMethod`: `"magic_link"` (default) or `"one_time_code"` | One-time code |
| Google OAuth | Button appears automatically when configured | Pass `showGoogleOAuth: true` (runs in an `ASWebAuthenticationSession` sheet) |
| After sign-in | Navigates to `defaultContinueRoute` | Renders the `AuthGateView` content closure |

### Choosing Your Email Sign-In Method (Web)

The Vue `PrimitiveLogin` component supports two email-based methods:

| Method | Value | How It Works |
|---|---|---|
| **Magic Link** (default) | `"magic_link"` | User receives a clickable sign-in link via email |
| **One-Time Password** | `"one_time_code"` | User receives a 6-digit code to enter in the app |

The iOS `PrimitiveLoginView` signs users in with a one-time email code.

## Setting Up Google OAuth (Optional)

Google OAuth lets users sign in with their Google account. This requires a one-time setup in both the Google Cloud Console and your Primitive app.

### 1. Create a Google OAuth Client

Go to the [Google Cloud Console OAuth page](https://console.cloud.google.com/auth/clients) and create a Web application client:

| Setting | Value |
|---|---|
| Authorized JavaScript origins | `http://localhost:5173` |
| Authorized redirect URIs | `http://localhost:5173/oauth/callback` |

Note your **Client ID** and **Client Secret**.

::: tip Production Setup
When deploying to production, add your production domain to these settings alongside localhost.
:::

### 2. Configure in Primitive

Enter your **Client ID** and **Client Secret** in the [Admin Console](https://admin.primitiveapi.com/login) under your app's Google OAuth settings, then enable the provider and allow your dev origin (see [Server App Settings](#server-app-settings-must-match-your-apps-origin) — the OAuth callback URL must also be in the app's **Redirect URIs**, set in the Admin Console):

```bash
primitive apps update --google-oauth true
primitive apps update --cors-origins "http://localhost:5173"
```

That's it — the template's login component automatically shows a "Sign in with Google" button when Google OAuth is configured.

## Passkeys (WebAuthn)

Passkeys let returning users sign in with biometrics (fingerprint, face) or hardware security keys. The template's login flow supports passkeys automatically — users can register a passkey after signing in, then use it for future logins.

## Email Template Customization

Customize the emails sent for magic links and OTP codes:

```bash
# View available template variables
primitive email-templates variables magic-link

# Set a custom template
primitive email-templates set magic-link \
  --subject "Sign in to MyApp" \
  --html-file ./magic-link.html \
  --text-file ./magic-link.txt

# Test the template
primitive email-templates test magic-link
```

## Invitations and Pending Shares

Any sign-in method resolves pending invitations and email-based shares automatically:

- If an invitation exists for the user's email, it's consumed and the user joins the app.
- Any pending document shares, group adds, or collection adds addressed to their email are applied atomically after the account is created — documents are shared, group and collection memberships are granted.
- Domain-mode apps re-validate the email domain at resolution time. A pending share for `alice@outside.com` won't land in an app restricted to `@mycompany.com`.

From the end-user's perspective: they sign in for the first time, and the things other people invited them into are already there. No manual "accept invitation" step.

See [Sharing and Invitations](./sharing-and-invitations.md) for how to create these shares.

## Disabling a User Per App

Admins can disable a user's access to a single app from the admin console without deleting their global account. A disabled user's existing tokens are revoked, open WebSocket connections are dropped, and any subsequent sign-in attempt (passkey, OAuth, magic link, OTP) is rejected with the error code `AUTH_USER_DISABLED`. Re-enabling restores access immediately; no re-invitation is needed.

Display `AUTH_USER_DISABLED` in your sign-in UI as a distinct error so the user understands they should contact an admin rather than retrying or trying a different method.

## Test User Sign-In for Automated Testing

For automated tests, Primitive supports a `+primitivetest` OTP bypass. Each app maintains a `testAccountBaseEmails` whitelist of base addresses (e.g. `alice@example.com`). For any whitelisted base, derived addresses of the form `<base-local>+primitivetest<suffix>@<base-domain>` skip the real email send on `otpRequest` and accept the magic code `000000` on `otpVerify`, returning a 30-minute token.

A single base authorizes unlimited role-distinguished derivatives — Gmail and Google Workspace deliver every `<base>+anything@<domain>` to the same inbox, so one real mailbox covers a fleet of test users:

```
alice+primitivetest@example.com
alice+primitivetest-teacher@example.com
alice+primitivetest-student@example.com
alice+primitivetest.ci-001@example.com
```

The suffix matches `[A-Za-z0-9._-]*` (possibly empty). Only single-`+` shapes are accepted: `alice+team+primitivetest-x@…` does not match.

Guardrails worth knowing:

- **Per-app whitelist.** A derived address is honored only when its base appears on this app's `testAccountBaseEmails` list. Apps without a whitelist have no bypass at all.
- **AppUser must already exist.** The bypass never auto-provisions. The derived account has to be a member of the app — through normal invitation, signup, or a deferred grant — before `000000` will let it in. This keeps a public-mode app from being signed up as `attacker+primitivetest@<whitelisted>`.
- **30-minute tokens.** Access tokens issued via this path expire after 30 minutes regardless of your normal session length, and carry a `primitiveBypass: true` claim. The whitelist is re-checked on each request, so removing a base from the list revokes its derived sessions immediately.
- **Reserved at admin/role/invitation boundaries.** A `+primitivetest*` email may sign in as an ordinary `member` user but cannot hold admin or owner privileges, and cannot be the recipient of an admin/role invitation. Attempts return `RESERVED_EMAIL_FOR_ADMIN`.
- **Whitelist limits.** Up to 50 base emails per app. A base may not itself be a `+primitivetest` derivative.

Use this for integration tests and local dev. Do not rely on it for staging or production flows.

Manage the `testAccountBaseEmails` whitelist either from the [Primitive CLI](./primitive-cli.md#test-users-for-automated-testing) (`primitive apps update --test-account-bases …`) or in the [Admin Console](./admin-console.md) settings UI. See the CLI page for managing the whitelist and signing in from a test.

## How It Works Under the Hood

For reference, here's what the starter templates handle for you:

- **Token management** — Access tokens are short-lived and refreshed automatically in the background. Refresh tokens are stored securely.
- **Auth state** — The client emits `authStateChanged` events that the templates use to switch between login and app UI (the web template's router guard; `AuthGateView` on iOS).
- **Logout** — Calling `client.auth.logout()` clears tokens, closes documents, and fires the auth state event. Both templates include a logout button (`PrimitiveProfileView` on iOS).
- **Safari compatibility** — The template's production deployment includes a first-party refresh proxy for Safari's strict cookie policies.

## Using the Client Directly

The templates are optional. Everything they do runs on public client APIs, so any web framework (React, Svelte, vanilla JS) or any Swift app can implement the same flows directly. Install the client — `npm install js-bao-wss-client`, or add the Swift package — and initialize it:

::: code-group

<<< ../../examples/auth/initialize-client.ts#example{ts} [JavaScript]

<<< ../../examples/auth/initialize-client.swift#example{swift} [Swift]

:::

Discover which sign-in methods are enabled before rendering any UI:

::: code-group

<<< ../../examples/auth/get-auth-config.ts#example{ts} [JavaScript]

<<< ../../examples/auth/get-auth-config.swift#example{swift} [Swift]

:::

**Google OAuth** — start the flow, then handle the callback (`?code=&state=`) on your redirect route. On iOS, present the URL in an `ASWebAuthenticationSession` (the iOS template's `PrimitiveAuthManager.startOAuth()` is a complete reference implementation):

::: code-group

<<< ../../examples/auth/oauth.ts#example{ts} [JavaScript]

<<< ../../examples/auth/oauth.swift#example{swift} [Swift]

:::

**Magic Link** — request a link, then verify the token your callback page receives:

::: code-group

<<< ../../examples/auth/magic-link.ts#example{ts} [JavaScript]

<<< ../../examples/auth/magic-link.swift#example{swift} [Swift]

:::

**One-Time Password** — request a 6-digit code, then verify it:

::: code-group

<<< ../../examples/auth/otp.ts#example{ts} [JavaScript]

<<< ../../examples/auth/otp.swift#example{swift} [Swift]

:::

Inspect session state and gate work on auth being ready:

::: code-group

<<< ../../examples/auth/session-state.ts#example{ts} [JavaScript]

<<< ../../examples/auth/session-state.swift#example{swift} [Swift]

:::

And sign out:

::: code-group

<<< ../../examples/auth/logout.ts#example{ts} [JavaScript]

<<< ../../examples/auth/logout.swift#example{swift} [Swift]

:::


## Next Steps

- **[Users and Groups](./users-and-groups.md)** — Organize users and manage access control
- **[Sharing and Invitations](./sharing-and-invitations.md)** — Invitations, email-based shares, access requests
- **[Overview](/)** — See how auth fits into the platform
