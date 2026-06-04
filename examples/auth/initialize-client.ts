import { initializeClient } from "js-bao-wss-client";

// Stand-alone client setup — no template app required.
// `initializeClient` constructs the client and awaits the auth bootstrap
// (restoring any persisted session), so it resolves ready to use.
export async function setupClient() {
  // #region example
  const client = await initializeClient({
    apiUrl: "https://primitiveapi.com",
    wsUrl: "wss://primitiveapi.com",
    appId: "YOUR_APP_ID",
  });

  // A persisted session (if any) has been restored by this point.
  if (client.isAuthenticated()) {
    const userId = await client.waitForUserId();
    console.log("signed in as", userId);
  }
  // #endregion example
  return client;
}
