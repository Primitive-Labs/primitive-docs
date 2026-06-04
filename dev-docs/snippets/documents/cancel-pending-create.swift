import JsBaoClient

// Cancel a pending local create. Pass `evictLocal: true` to also drop the
// document's local data after cancelling.
func cancelPendingCreate(client: JsBaoClient, documentId: String) async {
  // #region example
  await client.documents.cancelPendingCreate(
    documentId: documentId,
    options: CancelPendingCreateOptions(evictLocal: true)
  )
  // #endregion example
}
