import JsBaoClient

// Execute a prompt against a specific config and read the typed result fields.
func runPromptWithConfig(client: JsBaoClient) async throws {
  // #region example
  let result = try await client.prompts.execute(
    promptKey: "my-prompt-key",
    options: ExecutePromptOptions(
      variables: ["text": "Hello world"], // → {{ input.text }}
      modelOverride: "anthropic/claude-3-5-sonnet", // optional; overrides config.model
      configId: "01ABC" // optional; defaults to activeConfigId
    )
  )

  let success = result.success         // Bool — generated successfully
  let output = result.output           // String — generated text
  let error = result.error             // String? — error message, if any
  let configId = result.configId       // String — which config was used
  let metrics = result.metrics         // { durationMs, inputTokens?, outputTokens?, totalTokens? }
  let rawResponse = result.rawResponse // raw provider response (don't depend on shape)
  // #endregion example
  _ = (success, output, error, configId, metrics, rawResponse)
}
