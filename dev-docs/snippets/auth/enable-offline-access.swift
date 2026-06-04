import JsBaoClient

// Enable offline access via the typed `client.auth` namespace. The result is
// now a typed `EnableOfflineAccessResult` (`enabled`, `method?`, `reason?`).
// The options struct still exposes only `ttlDays` + a Swift-only
// `requireBiometric` flag (default `true`, inverted vs JS) — there is no
// `preferBiometric` / `allowPinFallback` / `retention` / `pinProvider`.
func enableOfflineAccess(client: JsBaoClient) async throws {
  // #region example
  let result = try await client.auth.enableOfflineAccess(
    options: EnableOfflineAccessOptions(ttlDays: 14, requireBiometric: true)
  )
  let enabled = result.enabled
  let method = result.method
  // #endregion example
  _ = (enabled, method)
}
