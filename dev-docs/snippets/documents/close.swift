import JsBaoClient

// Close an open document, optionally evicting its local data. Returns
// { evicted } — eviction is skipped (evicted == false) if local writes are
// still unsynced.
func close(client: JsBaoClient, documentId: String) async {
  // #region example
  let result = await client.documents.close(
    documentId, options: CloseDocumentOptions(evictLocal: true)
  )
  let evicted = result.evicted
  // #endregion example
  _ = evicted
}
