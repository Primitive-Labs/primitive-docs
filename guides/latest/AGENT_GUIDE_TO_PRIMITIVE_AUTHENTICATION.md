# Agent Guide to Primitive Authentication

Guidelines for AI agents implementing authentication flows in Primitive apps.

## Overview

Primitive supports multiple authentication methods:

| Method | Description | Use Case |
|--------|-------------|----------|
| OAuth (Google) | Redirect-based Google sign-in | Primary auth for most apps |
| Magic Link | Passwordless email link | Simple, no password needed |
| OTP | 6-digit email code | Quick verification |
| Passkey | WebAuthn/biometric | Secure, passwordless return visits |

All methods must be enabled in the Primitive Admin Console before use.

## Checking Available Auth Methods

```typescript
const config = await client.getAuthConfig();

if (config.hasOAuth) console.log("Google OAuth available");
if (config.magicLinkEnabled) console.log("Magic link available");
if (config.otpEnabled) console.log("OTP available");
if (config.hasPasskey) console.log("Passkeys available");
```

---

## OAuth (Google Sign-In)

### Start OAuth Flow

```typescript
const hasOAuth = await client.checkOAuthAvailable();
if (hasOAuth) {
  await client.startOAuthFlow(); // Redirects to Google
}
```

### Handle OAuth Callback

In your callback page (e.g., `/oauth/callback`):

```typescript
import { JsBaoClient } from "js-bao-wss-client";

const params = new URLSearchParams(window.location.search);
const code = params.get("code");
const state = params.get("state");

if (code && state) {
  const token = await JsBaoClient.exchangeOAuthCode({
    apiUrl: API_URL,
    appId: APP_ID,
    code,
    state,
  });

  // Store token and redirect to app
  localStorage.setItem("jwt", token);
  window.location.href = "/";
}
```

---

## Magic Link Authentication

### Request Magic Link

```typescript
await client.magicLinkRequest("user@example.com");
// User receives email with sign-in link
```

### Handle Magic Link Callback

```typescript
const params = new URLSearchParams(window.location.search);
const magicToken = params.get("magic_token");

if (magicToken) {
  const { user, isNewUser, promptAddPasskey } = await client.magicLinkVerify(magicToken);

  if (isNewUser) {
    // Show onboarding for new users
  }

  if (promptAddPasskey) {
    // Prompt user to add passkey for faster future logins
  }
}
```

---

## OTP (Email Code) Authentication

### Request OTP

```typescript
await client.otpRequest("user@example.com");
// User receives 6-digit code via email
// Code valid for 10 minutes
```

### Verify OTP

```typescript
const { user, isNewUser } = await client.otpVerify("user@example.com", "123456");

if (isNewUser) {
  // Show onboarding
}
```

### Error Handling

```typescript
try {
  await client.otpVerify(email, code);
} catch (error) {
  switch (error.code) {
    case "OTP_NOT_ENABLED":
      // OTP not enabled for this app
      break;
    case "RATE_LIMITED":
      // Too many attempts
      break;
    case "OTP_MAX_ATTEMPTS":
      // Max verification attempts, request new code
      break;
    case "INVALID_TOKEN":
      // Invalid or expired code
      break;
  }
}
```

---

## Passkey Authentication

Passkeys require an existing account (created via OAuth or Magic Link).

### Sign In with Passkey

```typescript
import { startAuthentication } from "@simplewebauthn/browser";

// 1. Get authentication options
const { options, challengeToken } = await client.passkeyAuthStart();

// 2. Authenticate with browser
const credential = await startAuthentication({ optionsJSON: options });

// 3. Complete authentication
const { user } = await client.passkeyAuthFinish(credential, challengeToken);
```

### Add Passkey to Account

User must be authenticated first:

```typescript
import { startRegistration } from "@simplewebauthn/browser";

// 1. Get registration options
const { options, challengeToken } = await client.passkeyRegisterStart();

// 2. Create passkey with browser
const credential = await startRegistration({ optionsJSON: options });

// 3. Complete registration
await client.passkeyRegisterFinish(credential, challengeToken, "MacBook Pro");
```

### Manage Passkeys

```typescript
// List passkeys
const { passkeys } = await client.passkeyList();
// [{ passkeyId, deviceName, createdAt, lastUsedAt }]

// Update device name
await client.passkeyUpdate(passkeyId, { deviceName: "Work Laptop" });

// Delete passkey
await client.passkeyDelete(passkeyId);
```

---

## Auth Events

Listen for authentication state changes:

```typescript
// Auth failed - prompt re-login
client.on("auth-failed", ({ message }) => {
  console.error("Auth failed:", message);
  redirectToLogin();
});

// Auth succeeded
client.on("auth-success", () => {
  console.log("Authenticated");
});

// Online auth required (went online without token)
client.on("auth:onlineAuthRequired", () => {
  promptUserToSignIn();
});

// Auth state changes
client.on("auth:state", ({ authenticated, mode }) => {
  console.log("Auth state:", authenticated, mode);
});

// Logout lifecycle
client.on("auth:logout", () => {
  // Logout started - clear sensitive state
});

client.on("auth:logout:complete", () => {
  // Logout finished
});
```

### Minimal Auth Handler

```typescript
const promptLogin = () => navigateToLogin();

client.on("auth-failed", promptLogin);
client.on("auth:onlineAuthRequired", promptLogin);
client.on("auth:state", ({ authenticated }) => {
  if (!authenticated) promptLogin();
});
```

---

## Auth State Model

The [primitive-app-template](https://github.com/AnchorPal/primitive-app-template) provides a `userStore` (Pinia store) and `AppLayout` component that implement the patterns described in this section. If you're not using the template, the same concepts apply — you'll need to implement equivalent auth state tracking in your own store/component layer.

The `userStore` exposes two key flags. Understanding their semantics is important for writing correct application code.

### `isInitialized` — one-way gate

Once `true`, it stays `true` for the lifetime of the app. It means the store has completed setup: event listeners are registered, auth config is loaded, and the store's reactive state is meaningful. It does **not** imply the user is authenticated.

Used by the router guard to catch developer errors (navigating to protected routes before the store is ready). Most application code does not need to check this directly.

### `isAuthenticated` — live reactive signal

Indicates whether the user has a valid session **right now**. Unlike `isInitialized`, this can change in both directions at any time:

- `false → true`: returning user (JWT in storage) during `initialize()`, or OAuth/magic link/passkey completing later
- `true → false`: server-side session invalidation (`auth-failed` event), explicit logout

This is a reactive ref, not a promise that resolves once. Treat it as ongoing state, not a one-time gate.

### `currentUser`

Populated **before** `isAuthenticated` becomes `true`. Safe to read whenever `isAuthenticated` is `true`.

### Auth-Dependent Code Patterns

#### AppLayout auth gate (recommended default)

The template's `AppLayout` (provided by primitive-app-template) gates all child content on `isAuthenticated`. If you're not using the template, implement an equivalent gate in your own layout. This means any component rendered inside the layout can assume:

- `currentUser` is available and non-null
- If auth is lost mid-session (token expiry, server-side invalidation), the component unmounts automatically

```vue
<!-- AppLayout.vue template structure -->
<template v-if="!userStore.isAuthenticated">
  <LoadingSpinner />
</template>
<div v-else>
  <!-- All app content here — currentUser guaranteed available -->
  <router-view />
</div>
```

This is the primary mechanism for preventing auth timing bugs. Components inside the layout **do not** need to check `isAuthenticated` or guard against `currentUser` being null.

#### Downstream stores — react to `isAuthenticated`

Stores that depend on auth state (e.g., opening documents, loading user-specific data) should watch `isAuthenticated` reactively rather than checking it once:

```typescript
// In a layout or app-level component
watch(
  () => userStore.isAuthenticated,
  async (isAuth, wasAuth) => {
    if (isAuth && !wasAuth) {
      // Auth gained — initialize auth-dependent resources
      await myStore.initialize();
    } else if (!isAuth && wasAuth) {
      // Auth lost — clean up
      myStore.reset();
    }
  },
  { immediate: true }
);
```

This handles both directions: initialization when auth arrives, and cleanup when auth is lost.

#### Sequencing: auth → documents → data

The correct initialization sequence for auth-dependent data loading is:

1. **Auth ready** (`isAuthenticated` becomes `true`)
2. **Open required documents** (call `documents.open()`)
3. **Query data** (via `useJsBaoDataLoader` with `documentReady`)

Do not open documents or query data before authentication is complete. The template's AppLayout auth gate ensures this structurally for components inside the layout; if you're not using the template, ensure your own layout provides an equivalent gate.

### How the Router Guard and Layout Gate Work Together

These serve complementary purposes:

- **Router guard** (`beforeEach`): prevents **navigation** to protected routes when `isAuthenticated` is `false`. Runs on route transitions only.
- **Layout auth gate** (`v-if`): prevents **rendering** of protected content. Handles the case where `isAuthenticated` transitions from `true → false` while the user is already on a protected route (e.g., session expiry).

The router guard is navigation-scoped; the layout gate is render-scoped. Together they ensure protected content is never visible to unauthenticated users, regardless of how the auth state changes.

---

## JWT Persistence

Persist JWT across page reloads (optional):

```typescript
const client = await initializeClient({
  // ... other options
  auth: {
    persistJwtInStorage: true,
    storageKeyPrefix: "my-app", // Namespace for multi-tenant
  },
});

// Check persistence status
const info = client.getAuthPersistenceInfo();
// { mode: "persisted", hydrated: true/false }
```

**Notes:**
- Token only reused if still valid (not within 2 min of expiry)
- Cleared on logout or auth failure
- Useful for reducing refresh calls on reload

---

## First-Party Refresh Proxy

For Safari and browsers that block third-party cookies:

```typescript
const client = await initializeClient({
  // ... other options
  auth: {
    refreshProxy: {
      baseUrl: `${window.location.origin}/proxy`,
      cookieMaxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
    },
  },
});
```

The `baseUrl` should point to a same-origin worker that forwards to `/app/:appId/api/auth/*`.

---

## Token Management

```typescript
// Check if authenticated
if (client.isAuthenticated()) {
  const token = client.getToken();
}

// Manually set token
client.setToken("new-jwt-token");

// Wait for user ID (useful after init)
const userId = await client.waitForUserId({ timeoutMs: 5000 });
```

---

## Logout

```typescript
await client.logout();
// Clears token, closes connections, emits auth:logout events
```

---

## Customizing Email Templates

The emails Primitive sends for Magic Link and OTP authentication can be customized via the CLI:

```bash
# See available email types and their current status
primitive email-templates list

# View a template (shows subject, HTML/text body, and available variables)
primitive email-templates get magic-link
primitive email-templates get otp

# See what variables are available in a template
primitive email-templates variables magic-link

# Override a template with custom content
primitive email-templates set magic-link \
  --subject "Sign in to MyApp" \
  --html-file ./emails/magic-link.html \
  --text-file ./emails/magic-link.txt

# Send a test email to verify your template
primitive email-templates test magic-link

# Revert to the default template
primitive email-templates delete magic-link
```

Email template overrides are also tracked as part of `primitive sync`, stored as TOML files in `email-templates/`. This lets you version-control your email customizations alongside other app configuration.

---

## Implementation Checklist

When implementing auth in a Primitive app:

1. **Check available methods** with `getAuthConfig()`
2. **Implement at least one primary method** (OAuth or Magic Link)
3. **Handle the callback route** for OAuth/Magic Link
4. **Listen to auth events** for state changes
5. **Consider passkeys** for returning users
6. **Handle errors gracefully** with user-friendly messages
7. **Customize email templates** if the default magic-link/OTP emails need branding
8. **Gate your app layout on `isAuthenticated`** so child components can assume `currentUser` is always available
9. **Watch `isAuthenticated` reactively** in downstream stores — it can change in both directions at any time
10. **Sequence initialization correctly**: auth ready → open documents → query data
