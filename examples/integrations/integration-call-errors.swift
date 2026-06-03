import JsBaoClient

// Call an integration and branch on the typed error code on failure.
func callIntegrationWithErrorHandling(client: JsBaoClient) async throws {
  // #region example
  do {
    _ = try await client.integrations.call(IntegrationCallRequest(
      integrationKey: "crm",
      method: "POST",
      path: "/contacts",
      body: ["email": "user@example.com"]
    ))
  } catch let error as JsBaoError {
    switch error.code {
    case .integrationNotFound:
      break // 404, also fires for status != active
    case .integrationSecretMissing:
      break // 409, MISSING_SECRET upstream
    case .integrationRequestInvalid:
      break // 400/413/422 (method/path/body)
    case .integrationProxyFailed:
      break // upstream timeout/network/malformed
    case .accessDenied:
      break // 401/403 (client auth)
    case .invalidArgument:
      break // missing integrationKey
    case .offline:
      break // SDK in offline mode
    default:
      break
    }
  }
  // #endregion example
}
