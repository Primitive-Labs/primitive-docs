# userStore

Pinia store for managing user authentication state and preferences.

The `useUserStore` provides reactive access to:
- Current user profile and authentication status
- Network connectivity status
- Authentication configuration (OAuth, passkey, magic link availability)
- User preferences (key-value storage synced to the root document)

## Usage

```ts
import { useUserStore } from 'primitive-app';

const userStore = useUserStore();

// Check authentication
if (userStore.isAuthenticated) {
  console.log('Welcome', userStore.currentUser?.displayName);
}

// Initiate login
await userStore.login('/dashboard');

// Check auth methods available
if (userStore.authConfig?.hasPasskey) {
  console.log('Passkeys are available');
}

// User preferences
await userStore.setPref('theme', 'dark');
const theme = userStore.getPref('theme', 'light');
```

## Initialization

The store must be initialized before use, typically done by `createPrimitiveApp`:

```ts
await userStore.initialize({ loginUrl: '/login' });
```

## State

### `currentUser`

The currently authenticated user's profile, or null if not authenticated.

### `isAuthenticated`

Whether the user is currently authenticated.

### `isOnline`

Whether the app has network connectivity.

### `isInitialized`

Whether the store has completed initialization.

### `authConfig`

Authentication configuration from the server.
Indicates which auth methods (OAuth, passkey, magic link) are available.

## Getters

### `isAdmin`

Whether the current user has admin privileges.

## Actions

### `initialize`

Initialize the user store with authentication configuration.
This is typically called by `createPrimitiveApp` during app bootstrap.

| Parameter | Description |
| --- | --- |
| `options` | Configuration options including the login URL |

### `login`

Initiate the OAuth login flow.

| Parameter | Description |
| --- | --- |
| `continueURL` | Optional URL to redirect to after successful login |

**Throws:** Error if OAuth is not available

### `handleOAuthCallback`

Handle the OAuth or magic link callback after the user returns.
This should be called from your callback route.
Automatically detects whether this is an OAuth callback (code+state) or
magic link callback (magic_token).

| Parameter | Description |
| --- | --- |
| `defaultContinueUrl` | URL to redirect to if no continue URL was in state |
| `loginUrl` | URL to redirect to on authentication failure |

**Returns:** Object with callback result including redirect URL and prompt flags

### `logout`

Log out the current user and optionally redirect.

| Parameter | Description |
| --- | --- |
| `redirectTo` | Optional URL to redirect to after logout |

### `requestMagicLink`

Request a magic link to be sent to the specified email address.

| Parameter | Description |
| --- | --- |
| `email` | Email address to send the magic link to |
| `redirectUri` | Optional URI to redirect to after verification |

**Returns:** Result indicating success

**Throws:** AuthError if request fails (e.g., INVITATION_REQUIRED, DOMAIN_NOT_ALLOWED)

### `startPasskeyAuth`

Start the passkey authentication flow.
Returns options to pass to startAuthentication().

**Returns:** Authentication options and challenge token

### `signInWithPasskey`

Sign in using a passkey credential.
Uses the WebAuthn API via @simplewebauthn/browser.

| Parameter | Description |
| --- | --- |
| `credential` | The credential from startAuthentication() |
| `challengeToken` | The challenge token from passkeyAuthStart() |

**Returns:** Object containing isNewUser flag if this is the user's first sign-in

### `startPasskeyRegistration`

Start the passkey registration flow.
Returns options to pass to startRegistration().

**Returns:** Registration options and challenge token

### `registerPasskey`

Register a new passkey for the current user.

| Parameter | Description |
| --- | --- |
| `credential` | The credential from startRegistration() |
| `challengeToken` | The challenge token from passkeyRegisterStart() |
| `deviceName` | Human-readable name for this passkey |

**Returns:** Result indicating success

### `listPasskeys`

List all passkeys registered for the current user.

**Returns:** Array of passkey information

### `deletePasskey`

Delete a passkey.

| Parameter | Description |
| --- | --- |
| `passkeyId` | ID of the passkey to delete |

**Returns:** Result indicating success

### `renamePasskey`

Rename a passkey.

| Parameter | Description |
| --- | --- |
| `passkeyId` | ID of the passkey to rename |
| `newDeviceName` | New name for the passkey |

**Returns:** The updated passkey info

### `getSuggestedDeviceName`

Get a suggested device name based on the current browser/platform.

**Returns:** Suggested device name string

### `updateProfile`

Update the current user's profile (name and/or avatar URL).
The profile state (`currentUser`) updates automatically via client events.

| Parameter | Description |
| --- | --- |
| `data` | Profile fields to update |

**Returns:** The updated user profile

### `uploadAvatar`

Upload an avatar image for the current user.
Automatically resizes the image if it exceeds the server's 1MB limit.
After upload, the profile's avatarUrl is automatically updated.

| Parameter | Description |
| --- | --- |
| `imageData` | The image as a Blob or File |
| `contentType` | The MIME type of the image |

**Returns:** The new avatar URL

### `getPref`

Get a user preference value.

| Parameter | Description |
| --- | --- |
| `key` | The preference key |
| `defaultValue` | Value to return if the preference is not set |

**Returns:** The stored preference value or the default

### `setPref`

Set a user preference value. The value is JSON-serialized and stored
in the user's root document for cross-device sync.

| Parameter | Description |
| --- | --- |
| `key` | The preference key |
| `value` | The value to store (must be JSON-serializable) |

**Throws:** Error if user is not authenticated

### `deletePref`

Delete a user preference.

| Parameter | Description |
| --- | --- |
| `key` | The preference key to delete |

**Throws:** Error if user is not authenticated

### `getAllPrefs`

Get a snapshot of all user preferences.

**Returns:** Object containing all preference key-value pairs

### `clearAllPrefs`

Delete all user preferences.

**Throws:** Error if user is not authenticated

## Exported types

### InitializeOptions

```ts
export interface InitializeOptions {
  loginUrl: string;
}
```

### AuthConfig

```ts
/**
 * Authentication configuration returned from the server.
 * Indicates which auth methods are available for the app.
 */
export interface AuthConfig {
  appId: string;
  name: string;
  /** App access mode: public, invite-only, or domain-restricted */
  mode: "public" | "invite-only" | "domain";
  /** Whether waitlist is enabled for invite-only apps */
  waitlistEnabled: boolean;
  /** Whether Google OAuth is configured and usable */
  hasOAuth: boolean;
  /** Whether passkeys are fully configured (enabled + rpId + rpName) */
  hasPasskey: boolean;
}
```

### MagicLinkRequestResult

```ts
/**
 * Result from requesting a magic link.
 */
export interface MagicLinkRequestResult {
  ok: boolean;
}
```

### MagicLinkVerifyResult

```ts
/**
 * Result from verifying a magic link.
 */
export interface MagicLinkVerifyResult {
  ok: boolean;
  /** User profile after successful verification */
  user?: {
    userId: string;
    email: string;
    name?: string;
  };
  /** True if user should be prompted to add a passkey */
  promptAddPasskey?: boolean;
  /** True if this is a newly created user (first sign-in) */
  isNewUser?: boolean;
  /** URL to redirect to after verification */
  redirectTo: string;
  /** Auth error code if verification failed */
  errorCode?: string;
  /** Error message for display or fallback detection */
  errorMessage?: string;
  /** True if the magic link token was expired or already used */
  tokenExpiredOrUsed?: boolean;
}
```

### PasskeyInfo

```ts
/**
 * Information about a registered passkey.
 */
export interface PasskeyInfo {
  passkeyId: string;
  deviceName: string;
  createdAt: string;
  lastUsedAt?: string;
}
```
