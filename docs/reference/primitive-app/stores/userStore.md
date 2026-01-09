# userStore

Pinia store for managing user authentication state and preferences.

The `useUserStore` provides reactive access to:
- Current user profile and authentication status
- Network connectivity status
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

Handle the OAuth callback after the user returns from the identity provider.
This should be called from your OAuth callback route.

| Parameter | Description |
| --- | --- |
| `defaultContinueUrl` | URL to redirect to if no continue URL was in state |
| `loginUrl` | URL to redirect to on authentication failure |

**Returns:** Object with `ok` boolean and `redirectTo` URL

### `logout`

Log out the current user and optionally redirect.

| Parameter | Description |
| --- | --- |
| `redirectTo` | Optional URL to redirect to after logout |

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
