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

## Implementation Checklist

When implementing auth in a Primitive app:

1. **Check available methods** with `getAuthConfig()`
2. **Implement at least one primary method** (OAuth or Magic Link)
3. **Handle the callback route** for OAuth/Magic Link
4. **Listen to auth events** for state changes
5. **Consider passkeys** for returning users
6. **Handle errors gracefully** with user-friendly messages
