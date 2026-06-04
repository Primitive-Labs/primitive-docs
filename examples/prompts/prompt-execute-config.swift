import Foundation
import JsBaoClient

// Execute a prompt against a specific config and read the result fields.
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

  let success = result["success"] as? Bool          // generated successfully
  let output = result["output"] as? String          // generated text
  let error = result["error"] as? String             // error message, if any
  let configId = result["configId"] as? String        // which config was used
  let metrics = result["metrics"] as? [String: Any]   // { durationMs, inputTokens?, ... }
  let rawResponse = result["rawResponse"]              // raw provider response
  // #endregion example
  _ = (success, output, error, configId, metrics, rawResponse)
}
