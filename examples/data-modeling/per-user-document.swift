import JsBaoClient

// Single per-user document pattern: atomically get-or-create the user's
// singleton document, open it, then read locally. After open() the document is
// cached on this client, so model reads run against local state.
func loadPersonalData(client: JsBaoClient, tasks: TypedModel<Task>) async throws {
  // #region example
  // On app load, after sign-in
  let result = try await client.documents.getOrCreateWithAlias(
    alias: ["scope": "user", "aliasKey": "default"],
    title: "My Data"
  )
  if let documentId = result["documentId"] as? String {
    _ = try await client.documents.open(documentId)
  }

  // Reads run against local state after open()
  let openTasks = tasks.query(["completed": false])
  // #endregion example
  _ = openTasks
}
