import type { JsBaoClient } from "js-bao-wss-client";

// Get the current user's permission level for a document (local, null if
// unknown).
export function getDocumentPermission(client: JsBaoClient, documentId: string) {
  // #region example
  const permission = client.documents.getDocumentPermission(documentId);
  // #endregion example
  return permission; // "owner" | "read-write" | "reader" | "admin" | null
}
