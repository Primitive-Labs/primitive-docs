import JsBaoClient

// Match on a specific error code. `code` is a `JsBaoErrorCode` enum, so
// compare against a case (here `.notFound`) rather than a raw string.
func matchCode(client: JsBaoClient, userId: String) async throws {
  // #region example
  do {
    _ = try await client.users.getBasic(userId: userId)
  } catch let err as JsBaoError where err.code == .notFound {
    print("no such user; showing empty state")
  }
  // #endregion example
}
