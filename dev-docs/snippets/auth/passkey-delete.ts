import type { JsBaoClient } from "js-bao-wss-client";

// Delete a registered passkey by id.
export async function passkeyDelete(client: JsBaoClient, passkeyId: string) {
  // #region example
  const { success } = await client.passkeyDelete(passkeyId);
  // #endregion example
  return success;
}
