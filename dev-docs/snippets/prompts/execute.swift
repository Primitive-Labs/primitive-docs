import JsBaoClient

// Execute a prompt by key. Both clients return a typed `ExecutePromptResult`.
func execute(client: JsBaoClient, promptKey: String) async throws {
  // #region example
  let result = try await client.prompts.execute(
    promptKey: promptKey,
    options: ExecutePromptOptions(
      variables: ["topic": "otters", "tone": "playful"],
      modelOverride: "gpt-4o"
    )
  )
  if result.success {
    print(result.output, result.metrics.totalTokens ?? 0)
  }
  // #endregion example
  _ = result
}
