import type { JsBaoClient } from "js-bao-wss-client";

// The "my documents" surface: what the user owns and what's been shared with
// them. Group-/collection-shared docs are NOT included here.
export async function listMyDocuments(client: JsBaoClient) {
  // #region example
  // Documents the user owns (created them, or ownership was transferred).
  const owned = await client.me.ownedDocuments();
  // Options: { includeRoot, tag, limit, cursor, forward, returnPage } —
  // pass returnPage: true for a paginated DocumentListPage.

  // Documents shared directly with the user.
  const { items } = await client.me.sharedDocuments();
  // Returns a { items, cursor } envelope. Each row carries the base document
  // fields plus the share extras (permission, source, grantedBy, invitationId).
  // #endregion example
  return { owned, items };
}
