import type { JsBaoClient } from "js-bao-wss-client";

// List app-level invitations (admin/owner only). Returns a typed
// `{ items, cursor }` page envelope.
export async function list(client: JsBaoClient) {
  // #region example
  const page = await client.invitations.list({ limit: 50 });
  for (const invitation of page.items) {
    console.log(invitation.email, invitation.accepted);
  }
  const nextCursor = page.cursor;
  // #endregion example
  return nextCursor;
}
