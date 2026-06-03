import JsBaoClient

// Enable offline access. Swift's options struct exposes `ttlDays` +
// `requireBiometric` (a Swift-only flag, default `true`) — there is no
// `preferBiometric` / `allowPinFallback` / `retention` / `pinProvider`. The
// result is an untyped `[String: Any]` (vs JS `{ enabled, method, reason }`).
func enableOfflineAccess(client: JsBaoClient) async throws {
  // #region example
  let result = try await client.enableOfflineAccess(
    options: EnableOfflineAccessOptions(ttlDays: 14, requireBiometric: true)
  )
  let enabled = result["enabled"] as? Bool ?? false
  let method = result["method"] as? String
  // #endregion example
  _ = (enabled, method)
}
