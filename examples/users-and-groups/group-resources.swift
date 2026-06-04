import JsBaoClient

// Inspect what a group can reach, and manage a document's group grants. A
// user's effective permission is the highest across direct + all group grants.
func groupResources(client: JsBaoClient, documentId: String) async throws {
  // #region example
  // What the group can access
  let docs = try await client.groups.listDocuments(groupType: "team", groupId: "engineering")
  let dbs = try await client.groups.listDatabases(groupType: "team", groupId: "engineering")

  // A document's group grants
  let groupPerms = try await client.documents.listGroupPermissions(documentId: documentId)
  _ = try await client.documents.revokeGroupPermission(
    documentId: documentId, groupType: "team", groupId: "engineering"
  )
  // #endregion example
  _ = (docs, dbs, groupPerms)
}
