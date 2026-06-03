import type { JsBaoClient } from "js-bao-wss-client";

// Evaluate a rule set against a simulated request via typed `TestRuleSetParams`.
export async function test(client: JsBaoClient, ruleSetId: string) {
  // #region example
  const result = await client.ruleSets.test(ruleSetId, {
    category: "documents",
    operation: "write",
    user: { userId: "user_123", role: "editor" },
  });
  // #endregion example
  return result.allowed;
}
