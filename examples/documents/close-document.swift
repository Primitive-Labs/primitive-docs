import JsBaoClient

// Close a document to stop syncing it. Pass `evictLocal: true` via
// CloseDocumentOptions to also drop the local cached copy.
//
// `close` returns a `CloseDocumentResult` whose `evicted` flag reports whether
// the local copy was actually dropped (it's skipped when local writes were
// still outstanding). The result is `@discardableResult`, so you can ignore it
// when you don't need to confirm eviction.
func closeDocument(client: JsBaoClient, documentId: String) async {
  // #region example
  // Close and stop syncing
  await client.documents.close(documentId)

  // Close and remove the local cached copy
  await client.documents.close(
    documentId,
    options: CloseDocumentOptions(evictLocal: true)
  )
  // #endregion example
}
