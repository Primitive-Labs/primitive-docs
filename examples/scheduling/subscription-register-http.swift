import JsBaoClient

// Register a database-type subscription via the admin HTTP API. Subscriptions
// are type-scoped (one definition per (databaseType, subscriptionKey) serves
// every database of that type). The caller's app needs admin permission.
// Wire-format field is `access` (NOT `accessRule`); both access and filter are
// required non-empty CEL strings.
func registerSubscription(adminClient: JsBaoClient) async throws {
  // #region example
  _ = try await adminClient.makeRequest(
    "POST",
    "/databases/types/support-desk/subscriptions",
    [
      "subscriptionKey": "my-open-tickets",
      "displayName": "My open tickets",
      "modelName": "ticket",
      "access": "user.userId != ''",
      "filter": "record.data.assigneeId == user.userId && record.data.status == 'open'",
      "select": ["id", "title", "priority", "updatedAt"],
      "emit": ["enter", "update", "leave"],
    ]
  )
  // #endregion example
}
