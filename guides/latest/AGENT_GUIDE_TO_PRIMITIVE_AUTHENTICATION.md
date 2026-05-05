# Agent Guide to Primitive Authentication

Implementing auth flows for Primitive apps. All methods live on `JsBaoClient` (package: `js-bao-wss-client`).

## Auth Methods

| Method | When to use |
|--------|-------------|
| OAuth (Google) | Primary auth, redirect-based |
| Magic Link | Passwordless email link |
| OTP | 6-digit email code (10 min expiry) |
| Passkey | WebAuthn for returning users (requires existing account) |

Each method must be enabled in the Admin Console. Check availability with `getAuthConfig()` before showing UI.

## Discovering Available Methods

```typescript
const config = await client.getAuthConfig();
// {
//   appId, name, mode, waitlistEnabled,
//   googleOAuthEnabled, googleClientId, hasOAuth, redirectUris,
//   passkeyEnabled, passkeyRpId, passkeyRpName, passkeyRpConfig, hasPasskey,
//   magicLinkEnabled, otpEnabled
// }

if (config.hasOAuth) showGoogleButton();
if (config.magicLinkEnabled) showMagicLinkForm();
if (config.otpEnabled) showOtpForm();
if (config.hasPasskey) showPasskeyButton();
```

`hasOAuth` is true when Google OAuth is enabled (the flag defaults to enabled when both `googleClientId` and the server-side `googleClientSecret` are configured). `hasPasskey` requires `passkeyEnabled` plus a non-empty `passkeyRpConfig` map. `magicLinkEnabled` and `otpEnabled` default to `true` unless explicitly disabled in the Admin Console.

### Passkey RP config (`passkeyRpConfig`)

`passkeyRpConfig` is a map keyed by RP ID (a bare domain — no protocol, no port, no path), with each value `{ name: string }`. One app can register passkeys against several origins (e.g. `app.example.com` and `staging.example.com`):

```jsonc
"passkeyRpConfig": {
  "app.example.com":     { "name": "Example" },
  "staging.example.com": { "name": "Example (staging)" }
}
```

`getAuthConfig()` returns the effective map. Configure passkeys via `passkeyRpConfig`.

---

## OAuth (Google)

### Start the flow

```typescript
const hasOAuth = await client.checkOAuthAvailable();
if (hasOAuth) {
  await client.startOAuthFlow(continueUrl); // Redirects browser to Google
}
```

`startOAuthFlow` throws `Error("OAuth not configured")` if `oauthRedirectUri` was not passed to `initializeClient`. The browser navigates away — code after the call doesn't run on success.

**`autoOAuth` client option.** Pass `autoOAuth: true` (with `oauthRedirectUri`) to `initializeClient` and the client will auto-redirect to OAuth whenever it comes back online without a valid token (e.g. a refresh failed, or there was no persisted token). For apps where OAuth is the only sign-in path this avoids hand-rolling the "no token, send to login" branch. Leave it off if you have multiple sign-in methods or want to render your own login screen first.

Optional second argument supports waitlist enrollment and invite-token acceptance:

```typescript
await client.startOAuthFlow(continueUrl, {
  waitlist: { source: "landing-page", note: "interested in beta" },
  inviteToken: tokenFromEmail,
});
```

### Handle the callback (instance method — preferred)

When the callback page can construct a client (you already have the JWT or are happy to re-init):

```typescript
const params = new URLSearchParams(window.location.search);
const code = params.get("code");
const state = params.get("state");

if (code && state) {
  await client.handleOAuthCallback(code, state);
  // Token now stored, WebSocket reconnected. Navigate.
  window.location.href = "/";
}
```

### Handle the callback (static method — when no client yet)

```typescript
import { JsBaoClient } from "js-bao-wss-client";

const token = await JsBaoClient.exchangeOAuthCode({
  apiUrl: API_URL,
  appId: APP_ID,
  code,
  state,
  // Pass these if your app uses a refresh proxy:
  refreshProxyBaseUrl: `${window.location.origin}/proxy`,
  refreshProxyCookieMaxAgeSeconds: 7 * 24 * 60 * 60,
});
// Persist however your app does (storage / cookie / pass to initializeClient)
```

**Don't:**

```typescript
// WRONG — startOAuthFlow does not return a token. It redirects.
const token = await client.startOAuthFlow();

// WRONG — handleOAuthCallback does not return the token either; it stores it.
const { token } = await client.handleOAuthCallback(code, state);
```

---

## Magic Link

### Request

```typescript
// Requires oauthRedirectUri set on the client OR explicit redirectUri option.
await client.magicLinkRequest("user@example.com");

// Override the redirect:
await client.magicLinkRequest("user@example.com", {
  redirectUri: "https://app.example.com/auth/magic-callback",
});
```

Throws `Error("Redirect URI not configured")` if neither is set.

### Verify (callback page reads `?magic_token=...`)

```typescript
const magicToken = new URLSearchParams(window.location.search).get("magic_token");

if (magicToken) {
  const { user, isNewUser, promptAddPasskey } = await client.magicLinkVerify(magicToken);
  // Token is now stored on the client and WS auto-connects.
  if (isNewUser) showOnboarding();
  if (promptAddPasskey) offerPasskeyRegistration();
}
```

The query param name is **`magic_token`** (not `token`, `magicToken`, or `code`).

The callback URL may also carry `?purpose=login-add-passkey`. The server appends this when the link was sent for an existing user the platform thinks should add a passkey (e.g. they signed in via OTP/magic-link but have no passkey on file). The `magicLinkVerify` call itself is unchanged — apps that read `purpose` from the URL can use it as a hint to route the user to passkey registration after sign-in instead of straight to the home screen.

To accept an invitation server-side at verify time (so the deferred grant resolves to the signing-in user even when emails differ), pass `inviteToken`:

```typescript
await client.magicLinkVerify(magicToken, { inviteToken: inviteTokenFromUrl });
```

---

## OTP (Email Code)

```typescript
await client.otpRequest("user@example.com");

// User enters the 6-digit code from email.
const { user, isNewUser } = await client.otpVerify("user@example.com", "123456");

if (isNewUser) showOnboarding();
```

Same `{ inviteToken }` option is supported on `otpVerify`.

### Error handling

`AuthError` is thrown for non-2xx responses with a machine-readable `code`. Import from the package:

```typescript
import { AuthError, AUTH_CODES } from "js-bao-wss-client";

try {
  await client.otpVerify(email, code);
} catch (err) {
  if (err instanceof AuthError) {
    switch (err.code) {
      case AUTH_CODES.INVALID_TOKEN:          // bad/expired code
      case AUTH_CODES.TOKEN_EXPIRED:          // token expired
      case AUTH_CODES.INVITATION_REQUIRED:    // invite-only app, no invitation
      case AUTH_CODES.DOMAIN_NOT_ALLOWED:     // domain-mode app, email not in allowed domains
      case AUTH_CODES.ADDED_TO_WAITLIST:      // waitlist enabled, user added
      case AUTH_CODES.WAITLIST_ENTRY_UPDATED: // existing waitlist entry updated
      case AUTH_CODES.PASSKEY_NOT_ENABLED:    // passkey off in admin console
      case AUTH_CODES.MAGIC_LINK_NOT_ENABLED: // magic link off in admin console
      case AUTH_CODES.INVITE_TOKEN_INVALID:   // bad invite token (#466)
      case AUTH_CODES.INVITE_TOKEN_EXPIRED:   // invite token expired
      case AUTH_CODES.INVITE_ALREADY_ACCEPTED: // invite already used
        showUserMessage(err.message);
        return;
    }
    // Server-only codes — not in the client's AUTH_CODES constant, so check
    // the string directly:
    switch (err.code) {
      case "RATE_LIMITED":            // too many requests; err may include retryAfter
      case "OTP_MAX_ATTEMPTS":        // too many bad guesses; request new code
      case "OTP_NOT_ENABLED":         // OTP off in admin console
      case "RESERVED_EMAIL_FOR_ADMIN": // +primitivetest emails can't hold admin/owner roles
        showUserMessage(err.message);
        return;
    }
  }
  throw err;
}
```

The exported `AUTH_CODES` constant covers: `ADDED_TO_WAITLIST`, `INVITATION_REQUIRED`, `DOMAIN_NOT_ALLOWED`, `INVALID_TOKEN`, `TOKEN_EXPIRED`, `PASSKEY_NOT_ENABLED`, `MAGIC_LINK_NOT_ENABLED`, `WAITLIST_ENTRY_UPDATED`, `INVITE_TOKEN_INVALID`, `INVITE_TOKEN_EXPIRED`, `INVITE_ALREADY_ACCEPTED`. The server may also return `RATE_LIMITED`, `OTP_MAX_ATTEMPTS`, and `RESERVED_EMAIL_FOR_ADMIN` — compare those as string literals.

> **Caveat on `OTP_NOT_ENABLED`.** The constant is defined and exported, but the OTP request endpoint currently returns a plain 400 with the message `"OTP authentication is not enabled for this app"` and **no `code` field** when OTP is disabled. Don't rely on switching on `OTP_NOT_ENABLED` to detect that case — gate the OTP UI on `getAuthConfig().otpEnabled` up front instead.

The same `AuthError` codes apply to `magicLinkRequest`/`magicLinkVerify` and `passkey*` methods.

---

## Passkeys

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

---

## Auth Events

These are the canonical events. `auth-failed` and `auth:onlineAuthRequired` are the ones most apps must handle.

```typescript
// Token refresh failed or server invalidated session — prompt re-login.
client.on("auth-failed", ({ message, reason }) => {
  redirectToLogin();
});

// Token applied successfully (login, refresh, or OAuth callback).
client.on("auth-success", ({ token, previousToken, cause }) => {
  // cause names the operation that produced the token. Stable values:
  //   Sign-in:    "oauthCallback" | "magicLinkVerify" | "otpVerify" | "passkeyAuth"
  //   Refresh:    "httpRefresh" | "ws-challenge" | "bootstrap:refresh" | "backoff-retry"
  //   Lifecycle:  "persisted-hydrate" | "ws-handshake" | "auto-network:online"
  //               | "networkMode:online" | "http-request"
  //   Manual:     "manual"
  // Treat unknown values as a generic success — the set may grow.
});

// Came back online without a valid token. Show sign-in.
client.on("auth:onlineAuthRequired", () => {
  promptSignIn();
});

// Generic state machine event — fires on transitions.
client.on("auth:state", ({ authenticated, mode, userId }) => {
  // mode: "online" | "offline" | "none" | "auto"
});

client.on("auth:logout", () => clearSensitiveUI());
client.on("auth:logout:complete", () => navigateHome());
```

**Don't:**

```typescript
// WRONG — there is no onAuthStateChange or signInWithGoogle on JsBaoClient.
// Use the events above and the explicit start*/verify* methods.
client.onAuthStateChange((u) => {});
await client.signInWithGoogle();
```

### Minimal handler

```typescript
const promptLogin = () => navigateToLogin();
client.on("auth-failed", promptLogin);
client.on("auth:onlineAuthRequired", promptLogin);
client.on("auth:state", ({ authenticated }) => { if (!authenticated) promptLogin(); });
```

---

## Token Inspection & Manual Token

```typescript
client.isAuthenticated();         // boolean
client.getToken();                // string | null

// Manually set a token (e.g. you obtained one out-of-band). Triggers
// auth-success and pushes through the normal apply-token pipeline.
client.setToken(jwt, { cause: "external" });

// Wait until a userId is available. Default timeout 5000ms.
const userId = await client.waitForUserId({ timeoutMs: 5000 });

// Wait until authenticated AND offline DBs are ready. Returns mode.
const { userId, mode } = await client.waitForAuthReady({ timeoutMs: 6000 });
```

`isAuthenticated()` returns true when either an online JWT or an unlocked offline identity is present.

**Don't:**

```typescript
// WRONG — there is no client.auth.setToken. It's client.setToken(...).
client.auth.setToken(jwt);

// WRONG — opening documents before auth is ready throws or fails silently.
const doc = await client.openDocument(id);     // before await client.waitForAuthReady()
```

---

## JWT Persistence

Optional — persists the JWT to storage so a page reload doesn't require re-authentication.

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

---

## Logout

```typescript
await client.logout();

// With options:
await client.logout({
  redirectTo: "/signed-out",
  wipeLocal: true,         // delete all locally cached document data + KV cache
  revokeOffline: true,     // also delete the persisted offline grant
  clearOfflineIdentity: true, // default true — drop in-memory offline identity
  waitForDisconnect: true, // wait for WS close before resolving
});
```

Logout fires `auth:logout` immediately and `auth:logout:complete` when finished.

---

## Auth State in Apps (Vue/template-aware)

The [primitive-app-template](https://github.com/AnchorPal/primitive-app-template) provides a `userStore` (Pinia) and `AppLayout` that implement these patterns. If you're not using the template, replicate the same gates.

### Two key flags

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

### Initialization order

1. Auth ready (`isAuthenticated === true` or `await client.waitForAuthReady()`)
2. Open documents (`documents.open(...)`)
3. Query data (e.g., `useJsBaoDataLoader` with `documentReady`)

Don't open documents or hit data APIs before step 1.

---

## Deferred Grant Resolution at Signup

Sign-in resolves any pending `DeferredDocumentPermission` and `DeferredGroupAdd` records for the user's email automatically inside `UserProvisioningService`.

Implications:

1. **Don't re-grant after signup.** If a doc was shared with the email pre-signup, the new user already has the bookmark and access.
2. **Domain-mode apps re-validate at resolution.** Deferred grants for emails outside allowed domains are silently dropped.
3. **`invitation`/`accepted` WS events fire after resolution** — subscribe to refresh the inviter's UI.

See the [Sharing and Invitations guide](AGENT_GUIDE_TO_PRIMITIVE_SHARING_AND_INVITATIONS.md#deferred-grants).

---

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

---

## Test User Sign-In (per-app whitelist)

There is **no `primitive test-users` CLI command**. The bypass is server-side: an OTP request for an email shaped like `<base-local>+primitivetest<suffix>@<base-domain>` accepts the magic code `"000000"` instead of the emailed code, but **only when the base address is on the app's `testAccountBaseEmails` whitelist**.

```typescript
// Requires the app owner to have added "alice@example.com" to the app's
// testAccountBaseEmails whitelist. Then any `alice+primitivetest<suffix>@example.com`
// derivative becomes a test account that accepts code "000000".
await client.otpRequest("alice+primitivetest@example.com");
const { user } = await client.otpVerify("alice+primitivetest@example.com", "000000");

// Role-distinguished derivatives (Gmail/Workspace deliver them to the same inbox):
await client.otpRequest("alice+primitivetest-teacher@example.com");
```

Guardrails:

- Per-app whitelist. The base address (`alice@example.com`) must be on the app's `testAccountBaseEmails` list — explicit owner consent.
- Only `+primitivetest<suffix>` derivatives are eligible. The bare base is never a test account, and the legacy `+primitive` form is no longer accepted.
- The derived user must already exist as an `AppUser` in this app — bypass never auto-provisions.
- Issued tokens are short-lived (~30 minutes) and carry a `primitiveBypass: true` claim that gets re-checked on every request, so removing the base from the whitelist revokes sessions immediately.
- `+primitivetest*` accounts can sign in as ordinary members but are reserved at admin / owner / invitation boundaries — they cannot hold those roles.

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
3. Build a callback route for OAuth (`?code=&state=`) and Magic Link (`?magic_token=`).
4. Listen to `auth-failed` and `auth:onlineAuthRequired` (minimum) to prompt re-login.
5. Catch `AuthError` and switch on `err.code` (use `AUTH_CODES` constants).
6. Gate your app layout on `isAuthenticated` so child components can assume `currentUser`.
7. Watch `isAuthenticated` reactively in downstream stores (it changes both directions).
8. Sequence: auth ready → open documents → query data.
9. Offer passkey registration when `promptAddPasskey` is true after magic-link/OTP verify.
10. Customize email templates via CLI if you need branded auth emails.
