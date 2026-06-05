import JsBaoClient

// One document per workspace, shared collaboratively: create the document,
// open it, then grant a teammate read-write access. Every member sees the full
// contents; Yjs merges concurrent edits.
func createWorkspaceDocument(client: JsBaoClient) async throws {
  // #region example
  let created = try await client.documents.create(
    options: CreateDocumentOptions(title: "Project Alpha", tags: ["workspace"])
  )
  let documentId = created.metadata?["documentId"]?.stringValue ?? ""
  _ = try await client.documents.open(documentId)

  _ = try await client.documents.updatePermissions(
    documentId: documentId,
    params: .email("alice@example.com", permission: "read-write")
  )
  // #endregion example
}
