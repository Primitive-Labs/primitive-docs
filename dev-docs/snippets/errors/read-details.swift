import JsBaoClient

// Read structured diagnostics off `error.details`. In Swift `details` is a
// `[String: JSONValue]?` — unwrap a value to its scalar before reading it.
// (e.g. `.numberValue`, `.stringValue`, `.boolValue`).
func readDetails(client: JsBaoClient, userId: String) async throws {
  // #region example
  do {
    _ = try await client.users.getBasic(userId: userId)
  } catch let err as JsBaoError {
    if let details = err.details {
      let status = details["status"]?.numberValue
      print("failed with status", status ?? -1, details)
    }
  }
  // #endregion example
}
