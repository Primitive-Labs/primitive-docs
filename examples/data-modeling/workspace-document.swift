import JsBaoClient

// One document per workspace, shared collaboratively: create the document,
// open it, then grant a teammate read-write access. Every member sees the full
// contents; Yjs merges concurrent edits.
func createWorkspaceDocument(client: JsBaoClient) async throws {
  // #region example
  let created = try await client.documents.create(options: [
    "title": "Project Alpha",
    "tags": ["workspace"],
  ])
  let metadata = created["metadata"] as? [String: Any]
  let documentId = metadata?["documentId"] as? String ?? ""
  _ = try await client.documents.open(documentId)

  _ = try await client.documents.updatePermissions(
    documentId: documentId,
    params: ["email": "alice@example.com", "permission": "read-write"]
  )
  // #endregion example
}
