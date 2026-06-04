import JsBaoClient

// Evict all locally stored document data. Pass `onlySynced: true` to preserve
// documents that still have unsynced local changes.
func evictAll(client: JsBaoClient) async {
  // #region example
  await client.documents.evictAll(
    options: EvictAllDocumentsOptions(onlySynced: true)
  )
  // #endregion example
}
