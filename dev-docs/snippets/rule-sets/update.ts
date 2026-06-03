import type { JsBaoClient } from "js-bao-wss-client";

// Update a rule set's name, description, or rules via typed `UpdateRuleSetParams`.
export async function update(client: JsBaoClient, ruleSetId: string) {
  // #region example
  const ruleSet = await client.ruleSets.update(ruleSetId, {
    description: "Updated policy",
  });
  // #endregion example
  return ruleSet;
}
