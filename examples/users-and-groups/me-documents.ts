import type { JsBaoClient } from "js-bao-wss-client";

// The two halves of "documents the user has direct access to", plus the
// pending-invitation inbox view.
export async function myDocuments(client: JsBaoClient) {
  // #region example
  // Documents the user owns (created, or had ownership transferred to).
  const owned = await client.me.ownedDocuments({
    tag: "draft", // optional tag filter
    limit: 50,
    // includeRoot: false, // root document excluded by default
  });

  // Documents shared directly with the user (non-owner permission rows +
  // pending invitations). Group/collection shares do NOT appear here.
  const { items, cursor } = await client.me.sharedDocuments({
    limit: 50,
    tag: "shared",
  });

  // Document invitations the user can accept — an inbox view.
  const pending = await client.me.pendingDocumentInvitations();
  // #endregion example
  return { owned, items, cursor, pending };
}
