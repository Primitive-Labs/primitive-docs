import type { JsBaoClient } from "js-bao-wss-client";

// Delete a rule set by its ID. JS returns a typed `{ success: boolean }`.
export async function deleteRuleSet(client: JsBaoClient, ruleSetId: string) {
  // #region example
  const { success } = await client.ruleSets.delete(ruleSetId);
  // #endregion example
  return success;
}
