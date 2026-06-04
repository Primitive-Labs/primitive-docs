import JsBaoClient

// List documents created locally but not yet committed, as
// { documentId, title?, createdAt } entries (PendingCreateInfo).
func listPendingCreates(client: JsBaoClient) async {
  // #region example
  let pending = await client.documents.listPendingCreates()
  // #endregion example
  _ = pending
}
