import type { JsBaoClient } from "js-bao-wss-client";

// Update a passkey's metadata (e.g. rename its device).
export async function passkeyUpdate(client: JsBaoClient, passkeyId: string) {
  // #region example
  const { passkey } = await client.passkeyUpdate(passkeyId, {
    deviceName: "Work Laptop",
  });
  // #endregion example
  return passkey;
}
