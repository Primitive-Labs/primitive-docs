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
//   passkeyEnabled, passkeyRpId, passkeyRpName, hasPasskey,
//   magicLinkEnabled, otpEnabled
// }

if (config.hasOAuth) showGoogleButton();
if (config.magicLinkEnabled) showMagicLinkForm();
if (config.otpEnabled) showOtpForm();
if (config.hasPasskey) showPasskeyButton();
```

`hasOAuth` is true only when both `googleOAuthEnabled` and `googleClientId` are set. `hasPasskey` requires `passkeyEnabled` and a configured `passkeyRpId`.

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
      case AUTH_CODES.OTP_NOT_ENABLED:        // OTP off in admin console
      case AUTH_CODES.RATE_LIMITED:           // too many requests
      case AUTH_CODES.OTP_MAX_ATTEMPTS:       // too many bad guesses; request new code
      case AUTH_CODES.INVALID_TOKEN:          // bad/expired code
      case AUTH_CODES.INVITATION_REQUIRED:    // invite-only app, no invitation
      case AUTH_CODES.DOMAIN_NOT_ALLOWED:     // domain-mode app, email not in allowed domains
      case AUTH_CODES.ADDED_TO_WAITLIST:      // waitlist enabled, user added
      case AUTH_CODES.RESERVED_EMAIL_FOR_ADMIN: // reserved domain
        showUserMessage(err.message);
        return;
    }
  }
  throw err;
}
```

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

await client.passkeyRegisterFinish(credential, challengeToken, "MacBook Pro");
// Optional 4th arg: { inviteToken } for invite acceptance during registration.
```

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
  // cause: "oauthCallback" | "magicLinkVerify" | "otpVerify" | "passkeyAuth" | "manual" | ...
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

## Test User Sign-In (non-prod only)

There is **no `primitive test-users` CLI command**. The bypass is server-side: an OTP request for an email containing `+primitive` accepts the magic code `"000000"` instead of the emailed code.

```typescript
// In a non-production environment with ENABLE_TEST_FEATURES=true
// (or ENVIRONMENT=local|test|dev):
await client.otpRequest("alice+primitive@example.com");
const { user } = await client.otpVerify("alice+primitive@example.com", "000000");
```

Guardrails:

- Env-gated. Production servers reject `"000000"` and fall through to the normal OTP path (which fails).
- The user must already exist as an `AppUser` in this app — bypass never auto-provisions.
- Issued tokens are short-lived (~30 minutes), regardless of session length config.
- Cannot mint admin tokens.

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
