import JsBaoClient

// Bulk-write through a registered batch operation. Each item is checked against
// the operation's per-item CEL independently.
func importContacts(client: JsBaoClient, databaseId: String) async throws {
  // #region example
  let result = try await client.databases.executeBatch(
    databaseId: databaseId,
    operationName: "import-contacts",
    batch: [
      ["params": ["name": "Alice", "email": "alice@example.com"]],
      ["params": ["name": "Bob", "email": "bob@example.com"]],
    ]
  )
  // result: { imported, failed }
  // #endregion example
  _ = result
}
