import type { JsBaoClient } from "js-bao-wss-client";

// Documents shared directly with the current user (non-owner permission
// grants + pending invitations). Group-/collection-shared docs are NOT here —
// list those through the group or collection.
export async function listSharedDocuments(client: JsBaoClient) {
  // #region example
  const { items, cursor } = await client.me.sharedDocuments({
    tag: "channel",
    limit: 50,
  });

  for (const doc of items) {
    // Each row carries the base document fields (title, createdAt, …) plus the
    // share extras (permission, source, grantedBy, invitationId).
    console.log(doc.title, doc.permission, doc.grantedBy);
  }

  // `cursor` is a raw-JSON pagination cursor — pass it back for the next page.
  if (cursor) {
    const next = await client.me.sharedDocuments({ cursor });
    return next;
  }
  // #endregion example
}
