import { initializeClient } from "js-bao-wss-client";

// Opt in to JWT persistence so a reload can reuse the short-lived token while
// it is still valid, instead of forcing a fresh sign-in. The token is cached
// in browser storage under `storageKeyPrefix` (namespace it when several
// clients share an origin).
export async function setupPersistedClient() {
  // #region example
  const client = await initializeClient({
    apiUrl: "https://primitiveapi.com",
    wsUrl: "wss://primitiveapi.com",
    appId: "YOUR_APP_ID",
    auth: {
      persistJwtInStorage: true,
      storageKeyPrefix: "my-app",
    },
  });

  // mode: "memory" | "persisted"; hydrated: was a cached token restored?
  const info = client.getAuthPersistenceInfo();
  // #endregion example
  return { client, info };
}
