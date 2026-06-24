import JsBaoClient

// Close a document to stop syncing it. Pass `evictLocal: true` via
// CloseDocumentOptions to also drop the local cached copy — eviction is
// skipped (`evicted: false`) if the server isn't yet confirmed to have all
// local writes, preventing data loss.
func closeDocument(client: JsBaoClient, documentId: String) async {
  // #region example
  // Close and stop syncing
  await client.documents.close(documentId)

  // Close and remove the local cached copy. `close` returns a
  // CloseDocumentResult — inspect `.evicted` when eviction matters.
  let result = await client.documents.close(
    documentId,
    options: CloseDocumentOptions(evictLocal: true)
  )
  if !result.evicted {
    // Server was not fully in sync — the local copy was retained.
  }
  // #endregion example
}
