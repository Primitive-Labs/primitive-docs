import type { JsBaoClient } from "js-bao-wss-client";

// Revoke a deferred grant. `type` ("document" | "group") is required because
// document and group deferred grants live in separate tables.
export async function revokeDeferredGrant(client: JsBaoClient, deferredId: string) {
  // #region example
  const result = await client.invitations.revokeDeferredGrant(deferredId, "document");
  // #endregion example
  return result.status;
}
