# Agent Guide to Primitive Authentication

Implementing auth flows for Primitive apps. All methods live on `JsBaoClient` (package: `js-bao-wss-client`).

## Auth Methods

| Method | When to use |
|--------|-------------|
| OAuth (Google) | Primary auth, redirect-based |
| Magic Link | Passwordless email link |
| OTP | 6-digit email code (10 min expiry) |
{{#lang ts}}
| Passkey | WebAuthn for returning users (requires existing account) |
{{/lang}}

Each method must be enabled in the Admin Console. Check availability with `getAuthConfig()` before showing UI.

## Client Setup (no template required)

All flows below run on a plain client — no starter template needed:

{{ example: auth/initialize-client }}

{{#lang ts}}
In the starter template this wiring is owned for you by the template's `userStore`.
{{/lang}}
{{#lang swift}}
In the starter template this wiring is owned for you by `PrimitiveAppState.initialize()` + `PrimitiveAuthManager`.
{{/lang}}

## Discovering Available Methods

{{ example: auth/get-auth-config }}

`hasOAuth` is true when Google OAuth is enabled (the flag defaults to enabled when both `googleClientId` and the server-side `googleClientSecret` are configured). `magicLinkEnabled` and `otpEnabled` default to `true` unless explicitly disabled in the Admin Console.
{{#lang ts}}
`hasPasskey` requires `passkeyEnabled` plus a non-empty `passkeyRpConfig` map.

### Passkey RP config (`passkeyRpConfig`)

`passkeyRpConfig` is a map keyed by RP ID (a bare domain — no protocol, no port, no path), with each value `{ name: string }`. One app can register passkeys against several origins (e.g. `app.example.com` and `staging.example.com`):

```jsonc
"passkeyRpConfig": {
  "app.example.com":     { "name": "Example" },
  "staging.example.com": { "name": "Example (staging)" }
}
```

`getAuthConfig()` returns the effective map. Configure passkeys via `passkeyRpConfig`.
{{/lang}}

## Server App Settings ↔ Client Contract

Server-side app settings must align with the origin the client app is served from. Inspect with `primitive apps get`; the relevant fields:

| Server field | Contract | Set via |
|---|---|---|
| `corsAllowedOrigins` | Must contain the exact serving origin (scheme+host+port). `corsMode` defaults to `custom` — an empty list blocks every cross-origin request. | `primitive apps update --cors-origins "<o1>,<o2>"` |
| `redirectUris` | OAuth callbacks are validated against this whitelist — a non-listed callback URL returns 400 `Invalid redirect URI`. | Admin Console only (no CLI flag) |
| `baseUrl` | Used for links in auth emails / redirects. | `primitive apps update --base-url <url>` |
{{#lang ts}}
| Provider toggles | `--google-oauth`/`--magic-link`/`--otp`/`--passkey <bool>` — what `getAuthConfig()` reports. | `primitive apps update` |
{{/lang}}
{{#lang swift}}
| Provider toggles | `--google-oauth`/`--magic-link`/`--otp <bool>` — what `getAuthConfig()` reports. | `primitive apps update` |
{{/lang}}

{{#lang ts}}
**CORS misconfiguration blocks bootstrap.** When the serving origin is missing from `corsAllowedOrigins`, the browser blocks the client's bootstrap refresh (`POST …/api/auth/refresh` → 403, no `access-control-allow-origin`): `initializeClient` throws `initializeClient refresh failed (network)` before `getAuthConfig()` is reached, and the template app's login surfaces the error. Fix by adding the serving origin (`primitive apps update --cors-origins`; inspect with `primitive apps get`). Common triggers: serving on a non-default port, or a newly deployed domain.
{{/lang}}

Dev → prod checklist: add the production origin to `corsAllowedOrigins`, add the production OAuth callback to `redirectUris` (Admin Console), update `baseUrl`, and re-check `getAuthConfig()` reports the expected methods.

---

## OAuth (Google)

### Start the flow

{{ example: auth/oauth }}

{{#lang ts}}
`startOAuthFlow` throws `Error("OAuth not configured")` if `oauthRedirectUri` was not passed to `initializeClient`. The browser navigates away — code after the call doesn't run on success.

**`autoOAuth` client option.** Pass `autoOAuth: true` (with `oauthRedirectUri`) to `initializeClient` and the client will auto-redirect to OAuth whenever it comes back online without a valid token (e.g. a refresh failed, or there was no persisted token). For apps where OAuth is the only sign-in path this avoids hand-rolling the "no token, send to login" branch. Leave it off if you have multiple sign-in methods or want to render your own login screen first.

Optional second argument supports waitlist enrollment and invite-token acceptance:

```typescript
await client.startOAuthFlow(continueUrl, {
  waitlist: { source: "landing-page", note: "interested in beta" },
  inviteToken: tokenFromEmail,
});
```
{{/lang}}
{{#lang swift}}
`startOAuthFlow(redirectUri:continueUrl:)` takes an explicit `redirectUri` and **returns** the authorization URL to open yourself (e.g. via `ASWebAuthenticationSession`). It throws `OAuth not configured` if OAuth is unavailable.
{{/lang}}

### Handle the callback (instance method — preferred)

When the callback page can construct a client (you already have the JWT or are happy to re-init), extract `code`/`state` from the callback and pass them to `handleOAuthCallback`:

{{ example: auth/oauth-callback }}

### Handle the callback (static method — when no client yet)

{{ example: auth/oauth-exchange-code }}

{{#lang ts}}
If your app uses a refresh proxy, also pass `refreshProxyBaseUrl` (e.g. `` `${window.location.origin}/proxy` ``) and `refreshProxyCookieMaxAgeSeconds` to `exchangeOAuthCode`.
{{/lang}}

**Don't:**

{{#lang ts}}
```typescript
// WRONG — startOAuthFlow does not return a token. It redirects.
const token = await client.startOAuthFlow();

// WRONG — handleOAuthCallback does not return the token either; it stores it.
const { token } = await client.handleOAuthCallback(code, state);
```
{{/lang}}
{{#lang swift}}
```swift
// WRONG — handleOAuthCallback does not return the token; it stores it.
let token = try await client.handleOAuthCallback(code: code, state: state)
```
{{/lang}}

---

## Magic Link

### Request + verify

{{ example: auth/magic-link }}

{{#lang ts}}
`magicLinkRequest` accepts an optional `redirectUri` (defaulting to the client's `oauthRedirectUri`) and throws `Error("Redirect URI not configured")` if neither is set.
{{/lang}}
{{#lang swift}}
`auth.magicLinkRequest(email:redirectUri:)` takes the `redirectUri` as a required argument. `auth.magicLinkVerify(token:inviteToken:)` returns a `MagicLinkVerifyResult` (`.user`, `.promptAddPasskey?`, `.isNewUser?`).
{{/lang}}

### Reading the token (callback page)

The callback delivers the token as a `magic_token` value — **not** `token`, `magicToken`, or `code`:

{{ example: auth/magic-link-callback }}

{{#lang ts}}
The callback URL may also carry `?purpose=login-add-passkey`. The server appends this when the link was sent for an existing user the platform thinks should add a passkey (e.g. they signed in via OTP/magic-link but have no passkey on file). The `magicLinkVerify` call itself is unchanged — apps that read `purpose` from the URL can use it as a hint to route the user to passkey registration after sign-in instead of straight to the home screen.
{{/lang}}

To accept an invitation server-side at verify time (so the deferred grant resolves to the signing-in user even when emails differ), pass `inviteToken`:

{{ example: auth/magic-link-invite }}

---

## OTP (Email Code)

{{ example: auth/otp }}

{{#lang ts}}
`otpVerify` also accepts an `{ inviteToken }` option to accept an invitation at verify time.
{{/lang}}
{{#lang swift}}
`auth.otpVerify(email:code:)` returns an `OtpVerifyResult` (`.user`, `.isNewUser?`).
{{/lang}}

### Error handling

`AuthError` is thrown for non-2xx responses with a machine-readable code:

{{ example: auth/auth-error-handling }}

> **Caveat on OTP disabled.** When OTP is disabled the request endpoint returns a plain 400 with the message `"OTP authentication is not enabled for this app"` and **no `code` field**. Don't rely on a code to detect that case — gate the OTP UI on `getAuthConfig()`'s `otpEnabled` up front instead.

{{#lang ts}}
The exported `AUTH_CODES` constant covers: `ADDED_TO_WAITLIST`, `INVITATION_REQUIRED`, `DOMAIN_NOT_ALLOWED`, `INVALID_TOKEN`, `TOKEN_EXPIRED`, `PASSKEY_NOT_ENABLED`, `MAGIC_LINK_NOT_ENABLED`, `WAITLIST_ENTRY_UPDATED`, `INVITE_TOKEN_INVALID`, `INVITE_TOKEN_EXPIRED`, `INVITE_ALREADY_ACCEPTED`. The server may also return `RATE_LIMITED`, `OTP_MAX_ATTEMPTS`, and `RESERVED_EMAIL_FOR_ADMIN` — compare those as string literals.

The same `AuthError` codes apply to `magicLinkRequest`/`magicLinkVerify` and `passkey*` methods.
{{/lang}}
{{#lang swift}}
`AuthCode` also carries the SDK-generated cases `.tokenInvalid`, `.refreshFailed`, `.networkError`, and `.unauthorized`, plus `.passkeyNotEnabled` and `.memberInvitationsDisabled` from the server. Server codes outside the enum (e.g. rate limiting) arrive with `code == nil` — fall back to `error.message`.

The same `AuthError` codes apply to `magicLinkRequest`/`magicLinkVerify`.
{{/lang}}

---

{{#lang ts}}
## Passkeys

WebAuthn passkeys for returning users, built on the browser's `@simplewebauthn/browser` helpers.

`passkeyAuthStart` works without an existing session (used to sign in). `passkeyRegisterStart` and management methods require an authenticated client.

### Sign in

```typescript
import { startAuthentication } from "@simplewebauthn/browser";

const { options, challengeToken } = await client.passkeyAuthStart();
const credential = await startAuthentication({ optionsJSON: options });
const { user, isNewUser } = await client.passkeyAuthFinish(credential, challengeToken);
```

### Register (must be authenticated)

```typescript
import { startRegistration } from "@simplewebauthn/browser";

const { options, challengeToken } = await client.passkeyRegisterStart();
const credential = await startRegistration({ optionsJSON: options });

const result = await client.passkeyRegisterFinish(
  credential,
  challengeToken,
  "MacBook Pro",
  { inviteToken: tokenFromEmail } // optional — accepts an invite during registration
);
// {
//   success: true,
//   credentialBackedUp?: boolean,           // present when the authenticator advertises BE/BS bits
//   invitation?: {                          // present only if inviteToken was supplied AND accepted
//     invitationId: string,
//     grantsResolved: { groups: number, documents: number },
//   }
// }
```

When `inviteToken` is supplied and the invitation resolves successfully, the `invitation` field reports how many deferred grants (group memberships + document permissions) were resolved to the new user — useful for a post-registration confirmation toast (e.g. "Joined 2 groups, 3 documents").

**Don't:**

```typescript
// WRONG — must call startAuthentication/startRegistration between start and finish.
const { challengeToken } = await client.passkeyAuthStart();
await client.passkeyAuthFinish(/* ??? */, challengeToken);

// WRONG — passkeyRegisterStart 401s if there is no current session.
// Sign the user in (OAuth/magic link/OTP/existing passkey) before registering.
```

### Manage

```typescript
const { passkeys } = await client.passkeyList();
// [{ passkeyId, deviceName, createdAt, lastUsedAt }]

await client.passkeyUpdate(passkeyId, { deviceName: "Work Laptop" });
await client.passkeyDelete(passkeyId);
```
{{/lang}}

---

## Auth Events

These are the canonical events.

{{#lang ts}}
`auth-failed` and `auth:onlineAuthRequired` are the ones most apps must handle. Register handlers with `client.on(...)`:
{{/lang}}
{{#lang swift}}
`authFailed` and `authState` are the ones most apps must handle. Register handlers with `client.events.on(...)`, which delivers typed event structs and returns an `EventSubscription` — hold it for as long as you want the handler live:
{{/lang}}

{{ example: auth/auth-events }}

{{#lang ts}}
**Don't:**

```typescript
// WRONG — there is no onAuthStateChange or signInWithGoogle on JsBaoClient.
// Use the events above and the explicit start*/verify* methods.
client.onAuthStateChange((u) => {});
await client.signInWithGoogle();
```
{{/lang}}

### Minimal handler

{{ example: auth/auth-events-minimal }}

---

## Per-App User Disable

Admins can disable a user's access to a single app without deleting their global user account. The `AppUser` record carries:

| Field | Meaning |
|---|---|
| `status` | `"active"` or `"disabled"`. Missing/null is treated as `"active"`. |
| `disabledAt` | Timestamp the user was disabled. |
| `disabledBy` | `adminId` that performed the disable. |

When `status === "disabled"`:

- Every auth-completion endpoint (OAuth callback, magic-link verify, OTP verify, and any other sign-in path) rejects with `AUTH_USER_DISABLED` before issuing tokens.
- The user's open WebSocket connections are force-disconnected by the server's connection layer.
- Existing access tokens are revoked; in-flight workflow runs the user started are terminated.

Admin endpoints (admin token required):

```http
PUT /admin/api/apps/{appId}/users/{userId}/disable
PUT /admin/api/apps/{appId}/users/{userId}/enable
```

The admin console exposes the same toggles. App code does not need to special-case disabled users — the platform rejects them before they get an authenticated session. Make sure error UIs render `AUTH_USER_DISABLED` differently from generic auth errors so the user knows to contact an admin.

---

## Token Inspection & Manual Token

{{ example: auth/session-state }}

`isAuthenticated()` returns true when either an online JWT or an unlocked offline identity is present.

To read or manually set the token:

{{ example: auth/manual-token }}

**Don't:**

{{#lang ts}}
```typescript
// WRONG — there is no client.auth.setToken. It's client.setToken(...).
client.auth.setToken(jwt);

// WRONG — opening documents before auth is ready throws or fails silently.
const doc = await client.openDocument(id);     // before await client.waitForAuthReady()
```
{{/lang}}
{{#lang swift}}
```swift
// WRONG — opening documents before auth is ready throws or fails silently.
let doc = try await client.openDocument(id)  // before try await client.waitForAuthReady()
```
{{/lang}}

---

## JWT Persistence

Optional — persists the JWT so a relaunch doesn't require re-authentication.

{{#lang ts}}
Opt in at `initializeClient` and the token is written to browser storage:

```typescript
import { initializeClient } from "js-bao-wss-client";

const client = await initializeClient({
  apiUrl, wsUrl, appId, oauthRedirectUri,
  auth: {
    persistJwtInStorage: true,
    storageKeyPrefix: "my-app", // namespace; required for multi-tenant on same origin
  },
});

const info = client.getAuthPersistenceInfo();
// { mode: "memory" | "persisted", hydrated: boolean }
```

Persisted tokens within ~2 min of expiry are not reused. Tokens are cleared on logout and on `auth-failed`.

---

## Refresh Proxy (Safari / 3rd-party cookie blockers)

```typescript
const client = await initializeClient({
  // ...
  auth: {
    refreshProxy: {
      baseUrl: `${window.location.origin}/proxy`,
      cookieMaxAgeSeconds: 7 * 24 * 60 * 60,
      enabled: true, // optional; defaults to true when refreshProxy is provided
    },
  },
});
```

`baseUrl` must be a same-origin worker that forwards `/auth/*` and `/oauth/callback` to `/app/:appId/api/auth/*`. When configured, `magicLinkVerify`, `otpVerify`, `handleOAuthCallback`, `logout`, and the OAuth-code static helper all route through the proxy.
{{/lang}}
{{#lang swift}}
The client persists the token to the Keychain across app launches. `waitForAuthBootstrap()` restores any persisted session, so an authenticated user stays signed in on relaunch. Tokens within ~2 min of expiry are not reused, and are cleared on logout and on `authFailed`.
{{/lang}}

---

## Logout

{{ example: auth/logout }}

{{#lang ts}}
`logout` accepts an options object to control teardown:

```typescript
await client.logout({
  redirectTo: "/signed-out",
  wipeLocal: true,         // delete all locally cached document data + KV cache
  revokeOffline: true,     // also delete the persisted offline grant
  clearOfflineIdentity: true, // default true — drop in-memory offline identity
  waitForDisconnect: true, // wait for WS close before resolving
});
```

Logout fires `auth:logout` immediately and `auth:logout:complete` when finished.
{{/lang}}
{{#lang swift}}
`auth.logout(options:)` takes a `LogoutOptions` — `wipeLocal` (delete locally cached document data + KV cache), `revokeOffline` (also revoke any stored offline grant), `clearOfflineIdentity` (defaults `true`), `waitForDisconnect` (await WebSocket teardown before returning; defaults `false`).
{{/lang}}

---

## Auth State in Apps

Gate the app's main layout on auth state so child views can assume an authenticated user, and react to auth loss centrally. The starter template implements this gate; if you're not using it, replicate it.

{{#lang ts}}
The template ([primitive-app-template](https://github.com/Primitive-Labs/primitive-app-template)) provides a `userStore` (Pinia) and `AppLayout`.

### Two key flags (template store)

- **`isInitialized`** — one-way. Becomes `true` once the store has wired listeners and loaded auth config. Does not mean the user is signed in. Used by router guards.
- **`isAuthenticated`** — live reactive. Can flip in either direction at any time (token expiry, server invalidation, login).

### Layout gate (recommended default)

```vue
<template v-if="!userStore.isAuthenticated">
  <LoadingSpinner />
</template>
<div v-else>
  <router-view />  <!-- currentUser guaranteed non-null inside here -->
</div>
```

Components inside the gate **don't** need to null-check `currentUser` or watch `isAuthenticated`. If auth is lost, they unmount.

### Reactive watchers (downstream stores)

```typescript
watch(
  () => userStore.isAuthenticated,
  async (isAuth, wasAuth) => {
    if (isAuth && !wasAuth) await myStore.initialize();
    else if (!isAuth && wasAuth) myStore.reset();
  },
  { immediate: true }
);
```
{{/lang}}
{{#lang swift}}
The template ([swift-primitive-app-dev](https://github.com/Primitive-Labs/swift-primitive-app-dev)) provides `PrimitiveAppState` + `PrimitiveAuthManager` (`@Published isAuthenticated`/`userId`/`loginState`) and `AuthGateView`.

### Layout gate (recommended default)

`AuthGateView(appState:appName:authManager:) { content }` is the layout gate — it walks initializing → login (`PrimitiveLoginView`) → connecting → connected and only renders `content` when connected, so views inside never null-check the user:

```swift
AuthGateView(appState: appState, appName: "MyApp", authManager: authManager) {
  RootView()  // user guaranteed non-nil inside here
}
```

### Reactive observers (downstream state)

Subscribe to `authManager.$isAuthenticated` (Combine) to initialize or reset downstream state on transitions:

```swift
authManager.$isAuthenticated
  .sink { isAuth in
    if isAuth { Task { await myStore.initialize() } }
    else { myStore.reset() }
  }
  .store(in: &cancellables)
```
{{/lang}}

### Initialization order

1. Auth ready (`isAuthenticated` true, or `await client.waitForAuthReady()`)
2. Open documents (`documents.open(...)`)
3. Query data

Don't open documents or hit data APIs before step 1.

---

## Deferred Grant Resolution at Signup

Sign-in resolves any pending `DeferredDocumentPermission` and `DeferredGroupAdd` records for the user's email automatically inside `UserProvisioningService`.

Implications:

1. **Don't re-grant after signup.** If a doc was shared with the email pre-signup, the new user already has access — the deferred grant resolved automatically.
2. **Domain-mode apps re-validate at resolution.** Deferred grants for emails outside allowed domains are silently dropped.
3. **`invitation`/`accepted` WS events fire after resolution** — subscribe to refresh the inviter's UI.

See the [Invitations guide](AGENT_GUIDE_TO_PRIMITIVE_INVITATIONS.md#deferred-grants).

---

{{#lang ts}}
## Invite Token Persistence Across Auth Round-Trips (Template Pattern)

When an invitation link carries an `inviteToken` query parameter and the recipient is not signed in, the token must survive the auth redirect so the server can resolve deferred grants atomically at verification time.

The template implements this in `src/lib/inviteToken.ts`:

```typescript
import {
  isPlausibleInviteToken,
  setPendingInviteToken,
  getPendingInviteToken,
  clearPendingInviteToken,
} from "@/lib/inviteToken";

// Stash on the accept page when user is signed out:
if (!user.isAuthenticated && isPlausibleInviteToken(rawToken)) {
  setPendingInviteToken(rawToken);  // saved to sessionStorage
}

// Consume during auth (done automatically by userStore):
const inviteToken = getPendingInviteToken() ?? undefined;
await client.otpVerify(email, code, { inviteToken });
if (inviteToken) clearPendingInviteToken();
```

The token is saved to `sessionStorage` under the key `"primitive:pendingInviteToken"`. The template's `userStore` automatically reads and forwards it through every auth path — `login()` (OAuth), `verifyOtp()`, the magic-link callback, and `registerPasskey()`. For OAuth (which round-trips through Google), the token also rides in the OAuth `state` parameter so the callback page can recover it even if the OAuth response opens in a tab without the original `sessionStorage`.

**`InviteAcceptPage` (template-provided):** The template ships a ready-made component at `src/pages/InviteAcceptPage.vue`, routed at `/invite/accept?inviteToken=...`. It handles:

- **Signed-in user** — prompts "Accept with this account or sign out and use a different one." Calls `client.invitations.accept(token)` on confirm.
- **Signed-out user** — stashes the token in `sessionStorage` and redirects to login. After sign-in the pending token is consumed inside the auth method.
- **Error states** — `INVITE_TOKEN_EXPIRED`, `INVITE_ALREADY_ACCEPTED`, `INVITE_TOKEN_INVALID`, and generic server errors.

If you're using the template, this route is already wired in `src/router/routes.ts`. Point your invitation emails at `${yourApp.baseUrl}/invite/accept?inviteToken=${token}`. You do **not** need to rebuild any of this.

**When building on the raw API** (without the template): stash and restore the token manually, pass it to the auth method that completes sign-in, and clear it immediately afterward. The `isPlausibleInviteToken` helper (16–512 chars, URL-safe charset) guards against obviously invalid input before touching storage.
{{/lang}}

---

## Test User Sign-In (per-app whitelist)

There is **no `primitive test-users` CLI command**. The bypass is server-side: an OTP request for an email shaped like `<base-local>+primitivetest<suffix>@<base-domain>` accepts the magic code `"000000"` instead of the emailed code, but **only when the base address is on the app's `testAccountBaseEmails` whitelist**.

{{ example: auth/test-user-otp }}

Guardrails:

- Per-app whitelist. The base address (`alice@example.com`) must be on the app's `testAccountBaseEmails` list — explicit owner consent.
- Only `+primitivetest<suffix>` derivatives are eligible. The bare base is never a test account.
- The derived user must already exist as an `AppUser` in this app — bypass never auto-provisions.
- Issued tokens are short-lived (~30 minutes) and carry a `primitiveBypass: true` claim that gets re-checked on every request, so removing the base from the whitelist revokes sessions immediately.
- `+primitivetest*` accounts can sign in as ordinary members but are reserved at admin / owner / invitation boundaries — they cannot hold those roles.

Manage the whitelist with `primitive apps update --test-account-bases …` (max 50 bases per app), or in the web-admin settings UI — both edit the same `testAccountBaseEmails` list.

**Don't use this in production user flows.**

---

## Customizing Email Templates

The Magic Link, OTP, and other emails Primitive sends can be customized via the CLI:

```bash
primitive email-templates list                       # all types + override status
primitive email-templates get magic-link             # subject + body + variables
primitive email-templates variables magic-link       # available {{vars}}
primitive email-templates set magic-link \
  --subject "Sign in to MyApp" \
  --html-file ./emails/magic-link.html \
  --text-file ./emails/magic-link.txt
primitive email-templates test magic-link            # send test email
primitive email-templates delete magic-link          # revert to default
```

Overrides are tracked by `primitive sync` (TOML in `email-templates/`). Custom templates can be triggered from `email.send` workflow steps — see the [Workflows guide](AGENT_GUIDE_TO_PRIMITIVE_WORKFLOWS.md).

---

## Implementation Checklist

1. Call `getAuthConfig()` to discover enabled methods before rendering UI.
2. Implement at least one primary method (OAuth or Magic Link).
3. Handle the OAuth callback (`code` + `state`) and the Magic Link `magic_token`.
{{#lang ts}}
4. Listen to `auth-failed` and `auth:onlineAuthRequired` (minimum) to prompt re-login.
5. Catch `AuthError` and switch on `err.code` (use `AUTH_CODES` constants).
6. Gate your app layout on `isAuthenticated` so child components can assume `currentUser`.
7. Watch `isAuthenticated` reactively in downstream stores (it changes both directions).
8. Sequence: auth ready → open documents → query data.
9. Offer passkey registration when `promptAddPasskey` is true after magic-link/OTP verify.
10. Customize email templates via CLI if you need branded auth emails.
{{/lang}}
{{#lang swift}}
4. Listen to `authFailed` and `onlineAuthRequired` (minimum) to prompt re-login.
5. Catch `AuthError` and switch on `error.code`.
6. Gate your app layout on `isAuthenticated` (via `AuthGateView`) so child views can assume an authenticated user.
7. Observe `authManager.$isAuthenticated` in downstream state (it changes both directions).
8. Sequence: auth ready → open documents → query data.
9. Customize email templates via CLI if you need branded auth emails.
{{/lang}}
