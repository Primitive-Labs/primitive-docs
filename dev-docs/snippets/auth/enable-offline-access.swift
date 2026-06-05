import JsBaoClient

// Enable offline access via the typed `client.auth` namespace. The result is
// a typed `EnableOfflineAccessResult` (`enabled`, `method?`, `reason?`).
// `EnableOfflineAccessOptions` accepts `preferBiometric` / `allowPinFallback` /
// `ttlDays` / `retention` / `pinProvider`, matching JS.
func enableOfflineAccess(client: JsBaoClient) async throws {
  // #region example
  let result = try await client.auth.enableOfflineAccess(
    options: EnableOfflineAccessOptions(
      preferBiometric: true,
      allowPinFallback: true,
      ttlDays: 14
    )
  )
  let enabled = result.enabled
  let method = result.method
  // #endregion example
  _ = (enabled, method)
}
