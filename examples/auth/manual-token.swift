import JsBaoClient

// Read the current token's claims, or set a token obtained out-of-band.
func manualToken(client: JsBaoClient, jwt: String) {
  // #region example
  // Manually set a token (e.g. obtained out-of-band). Triggers authSuccess
  // and pushes through the normal apply-token pipeline.
  client.updateToken(jwt, cause: "external")

  // Read the current token via the decoded JWT payload, or track it from the
  // authSuccess event.
  let payload = client.getJwtPayload()
  // #endregion example
  _ = payload
}
