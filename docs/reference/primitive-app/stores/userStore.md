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

## Exported types

### InitializeOptions

```ts
export interface InitializeOptions {
  loginUrl: string;
}
```
