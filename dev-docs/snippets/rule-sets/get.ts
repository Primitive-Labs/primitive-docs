import type { JsBaoClient } from "js-bao-wss-client";

// Retrieve a single rule set by its ID.
export async function get(client: JsBaoClient, ruleSetId: string) {
  // #region example
  const ruleSet = await client.ruleSets.get(ruleSetId);
  // #endregion example
  return ruleSet;
}
