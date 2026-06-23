# Authentication

The starter templates — web (Vue) and iOS (SwiftUI) — come with a complete authentication flow out of the box: login UI, token management, session handling, and multiple sign-in methods. You don't need to build auth screens or wire up the client yourself. Not using a template? Every flow is also available directly on the client — see [Using the Client Directly](#using-the-client-directly).

The two things you may want to configure are:

1. **Email sign-in method** — Magic Link or One-Time Password
2. **Google OAuth** — Optional, requires setting up a Google OAuth client

## Server App Settings Must Match Your App's Origin

Authentication runs against server-side **app settings** that must line up with where your client app is actually served. These settings live in your synced `app.toml` — edit the TOML and run `primitive sync push` so the server matches what's checked into your repo. Three settings matter, and a mismatch in the first one fails in a particularly confusing way:

| Setting | What it does | Where it lives |
|---|---|---|
| **CORS allowed origins** | The whitelist of origins allowed to call the Primitive API from a browser. Your serving origin (scheme + host + port) must be listed. | `[cors].allowedOrigins` in `app.toml` |
| **Redirect URIs** | The whitelist of OAuth callback URLs. The callback your app uses must match exactly, or the OAuth callback fails with `Invalid redirect URI`. | `primitive apps update --redirect-uris` or Admin Console (not in `app.toml`) |
| **Base URL** | Where the app is served — used for links in auth emails and redirects. | `[app].baseUrl` in `app.toml` |

Inspect all three anytime with `primitive apps get`.

The `primitive apps update --cors-origins …` / `--base-url …` flags set the same values imperatively — useful for a quick one-off, but a flag change mutates the server without touching `app.toml`, so the next `primitive sync push` reverts it unless you mirror the change back into the TOML. Prefer editing `app.toml` and pushing.

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
| Social sign-in | Google button appears automatically when configured | Google and Sign in with Apple buttons appear automatically when configured (Google runs in an `ASWebAuthenticationSession` sheet) |
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

Enter your **Client ID** and **Client Secret** in the [Admin Console](https://admin.primitiveapi.com/login) under your app's Google OAuth settings, then enable the provider and allow your dev origin (see [Server App Settings](#server-app-settings-must-match-your-apps-origin) — the OAuth callback URL must also be in the app's **Redirect URIs** — set via `primitive apps update --redirect-uris` or the Admin Console). Set the provider toggle and origin in `app.toml` and push:

```toml
# config/app.toml
[auth]
googleOAuthEnabled = true

[cors]
mode = "custom"
allowedOrigins = ["http://localhost:5173"]
```

```bash
primitive sync push
```

That's it — the template's login component automatically shows a "Sign in with Google" button when Google OAuth is configured.

## Passkeys (WebAuthn)

Passkeys let returning users sign in with biometrics (fingerprint, face) or hardware security keys. The web template's `PrimitiveLogin` flow supports passkeys automatically — users can register a passkey after signing in, then use it for future logins.

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

Signing in is what resolves anything waiting on a user's email — a pending app invitation, plus any document shares, group adds, or collection adds addressed to them. On first sign-in, with any method, it's all applied automatically; there's no manual "accept invitation" step, so the things other people invited them into are already there. See [Invitations](./invitations.md) for how those shares are created and the full resolution rules.

## Disabling a User Per App

Admins can disable a user's access to a single app from the admin console without deleting their global account. A disabled user's existing tokens are revoked, open WebSocket connections are dropped, and any subsequent sign-in attempt (passkey, OAuth, magic link, OTP) is rejected with the error code `AUTH_USER_DISABLED`. Re-enabling restores access immediately; no re-invitation is needed.

Display `AUTH_USER_DISABLED` in your sign-in UI as a distinct error so the user understands they should contact an admin rather than retrying or trying a different method.

## Test User Sign-In for Automated Testing

For integration tests and local dev, Primitive supports a `+primitivetest` OTP bypass: whitelist a base email per app, and derived addresses like `alice+primitivetest-teacher@example.com` sign in through the normal OTP flow with the magic code `000000` — no real email round-trip. One mailbox covers a whole fleet of role-distinguished test users.

See [Test Users for Automated Testing](./primitive-cli.md#test-users-for-automated-testing) on the CLI page for setup, the sign-in pattern, and the security guardrails.

## How It Works Under the Hood

For reference, here's what the starter templates handle for you:

- **Token management** — Access tokens are short-lived and refreshed automatically in the background. Refresh tokens are stored securely.
- **Auth state** — The client emits `authStateChanged` events that the templates use to switch between login and app UI (the web template's router guard; `AuthGateView` on iOS).
- **Logout** — Calling `client.auth.logout()` clears tokens, closes documents, and fires the auth state event. Both templates include a logout button (`PrimitiveProfileView` on iOS).
- **Safari compatibility** — The template's production deployment includes a first-party refresh proxy for Safari's strict cookie policies.

## Using the Client Directly

The templates are optional. Everything they do runs on public client APIs, so any web framework (React, Svelte, vanilla JS) or any Swift app can implement the same flows directly. Install the client — `pnpm add js-bao-wss-client`, or add the Swift package — and initialize it:

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

On iOS, `signInWithGoogle` and `signInWithApple` wrap the whole flow in a single call — they present the system auth sheet, run the redirect and code exchange, apply the session token, and reconnect the WebSocket. Each returns the signed-in `userId` and an `isNewUser` flag. Google derives its redirect URI from the bundled `GoogleService-Info.plist` (or pass `redirectUri:` explicitly); Apple uses the app's "Sign in with Apple" entitlement and the server's configured Apple audiences. Read `hasApple` from the auth config to decide whether to show the Apple button.

```swift
let google = try await client.signInWithGoogle()
// google.userId, google.isNewUser

let apple = try await client.signInWithApple()
// apple.userId, apple.isNewUser
```

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
- **[Invitations](./invitations.md)** — Access modes, invitations, and how email-based shares resolve
- **[Overview](/)** — See how auth fits into the platform
