import JsBaoClient

// Administrative database lifecycle: list (optionally filtered by type),
// fetch, rename, and delete. These require a direct owner/manager grant.
func manageDatabases(client: JsBaoClient, databaseId: String) async throws {
  // #region example
  // Databases where the caller is owner or manager (admins see all).
  // Databases reachable only via CEL-gated operations or group grants are
  // NOT returned here — use groups.listDatabases for group-shared ones.
  let databases = try await client.databases.list()

  // Narrow to one databaseType (post-join filter — narrows, never widens).
  let projects = try await client.databases.list(databaseType: "project")

  let db = try await client.databases.get(databaseId: databaseId)

  _ = try await client.databases.update(
    databaseId: databaseId,
    params: UpdateDatabaseParams(title: "New Title")
  )

  // Owner only — permanently removes all records and permissions.
  _ = try await client.databases.delete(databaseId: databaseId)
  // #endregion example
  _ = (databases, projects, db)
}
