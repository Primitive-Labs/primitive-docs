import type { JsBaoClient } from "js-bao-wss-client";

// Close a document to stop syncing it. Pass `evictLocal: true` to also drop the
// local cached copy — eviction is skipped (evicted: false) if the server is not
// yet confirmed to have all local writes, preventing data loss.
export async function closeDocument(client: JsBaoClient, documentId: string) {
  // #region example
  // Close and stop syncing
  await client.documents.close(documentId);

  // Close and remove the local cached copy (safe: skipped if not fully synced)
  const { evicted } = await client.documents.close(documentId, {
    evictLocal: true,
  });
  if (!evicted) {
    // Server was not fully in sync — local copy was retained
  }
  // #endregion example
  return evicted;
}
