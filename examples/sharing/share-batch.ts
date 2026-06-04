import type { JsBaoClient } from "js-bao-wss-client";

// Share a document with several people at once, mixing user IDs and emails.
export async function batchShare(client: JsBaoClient, documentId: string) {
  // #region example
  await client.documents.updatePermissions(documentId, {
    permissions: [
      { userId: "user-abc", permission: "read-write" },
      { email: "alice@example.com", permission: "reader" },
      { email: "bob@example.com", permission: "read-write" },
    ],
  });
  // #endregion example
}
