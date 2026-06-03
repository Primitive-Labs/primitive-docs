import type { JsBaoClient } from "js-bao-wss-client";

// Debug rule evaluation for a real user via typed `DebugRuleSetParams`,
// returning the full evaluation trace and context.
export async function debug(client: JsBaoClient) {
  // #region example
  const result = await client.ruleSets.debug({
    userId: "user_123",
    groupType: "team",
    category: "documents",
    operation: "write",
  });
  // #endregion example
  return result.allowed;
}
