import type { JsBaoClient } from "js-bao-wss-client";

// Inspect auth state and gate work on auth being ready.
export async function sessionState(client: JsBaoClient) {
  // #region example
  const signedIn = client.isAuthenticated(); // boolean

  // Wait until a userId is available. Default timeout 5000ms.
  const userId = await client.waitForUserId({ timeoutMs: 5000 });

  // Wait until authenticated AND offline DBs are ready. Returns the mode.
  const ready = await client.waitForAuthReady({ timeoutMs: 6000 });
  // #endregion example
  return { signedIn, userId, ready };
}
