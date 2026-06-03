import JsBaoClient

// Catch a JsBaoError thrown by a client call and read its `code`.
// Swift uses a typed `catch let err as JsBaoError` instead of a duck-type guard.
func catchError(client: JsBaoClient, userId: String) async throws {
  // #region example
  do {
    _ = try await client.users.getBasic(userId: userId)
  } catch let err as JsBaoError {
    print("client error:", err.code.rawValue, err.message)
  }
  // #endregion example
}
