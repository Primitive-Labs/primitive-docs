import JsBaoClient

// Run a managed prompt with variables; optionally override the model/config.
func runPrompt(client: JsBaoClient, documentText: String) async throws {
  // #region example
  let result = try await client.prompts.execute(
    promptKey: "my-summarizer",
    options: ExecutePromptOptions(
      variables: ["text": .string(documentText), "style": "concise"],
      modelOverride: "gpt-4o" // optional; defaults to the active config's model
    )
  )
  // #endregion example
  _ = result
}
