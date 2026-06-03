import JsBaoClient

// Execute a prompt by key. Swift returns an untyped `[String: Any]`, so read
// the result with dictionary casts (vs the JS `ExecutePromptResult`).
func execute(client: JsBaoClient, promptKey: String) async throws {
  // #region example
  let result = try await client.prompts.execute(
    promptKey: promptKey,
    options: ExecutePromptOptions(
      variables: ["topic": "otters", "tone": "playful"],
      modelOverride: "gpt-4o"
    )
  )
  if let success = result["success"] as? Bool, success {
    let output = result["output"] as? String
    print(output ?? "")
  }
  // #endregion example
  _ = result
}
