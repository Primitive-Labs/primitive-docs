import type { JsBaoClient } from "js-bao-wss-client";

// A single batch share can mix user-id grants and email grants. Email grants
// resolve immediately for existing users, or stay pending until signup.
export async function shareBatch(client: JsBaoClient, documentId: string) {
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
