import JsBaoClient

// Read structured diagnostics off `error.details`. In Swift `details` is a
// flat `[String: String]?` — values are always strings (no nesting/numbers).
func readDetails(client: JsBaoClient, userId: String) async throws {
  // #region example
  do {
    _ = try await client.users.getBasic(userId: userId)
  } catch let err as JsBaoError {
    if let details = err.details {
      let status = details["status"]
      print("failed with status", status ?? "?", details)
    }
  }
  // #endregion example
}
