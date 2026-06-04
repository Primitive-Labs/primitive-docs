import type { JsBaoClient } from "js-bao-wss-client";

// Sign the user out, optionally wiping locally cached data.
export async function signOut(client: JsBaoClient) {
  // #region example
  await client.logout({
    wipeLocal: true, // delete locally cached document data + KV cache
    waitForDisconnect: true, // wait for the WS to close before resolving
  });
  // Fires `auth:logout` immediately and `auth:logout:complete` when finished.
  // #endregion example
}
