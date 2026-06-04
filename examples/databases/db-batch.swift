import JsBaoClient

// Bulk-call a registered mutation operation. Access rules are re-evaluated
// against each item's params; any failing item rejects the whole batch.
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
