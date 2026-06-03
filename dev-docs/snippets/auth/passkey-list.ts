import type { JsBaoClient } from "js-bao-wss-client";

// List all passkeys registered for the current user.
export async function passkeyList(client: JsBaoClient) {
  // #region example
  const { passkeys } = await client.passkeyList();
  // #endregion example
  return passkeys;
}
