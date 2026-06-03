import type { JsBaoClient } from "js-bao-wss-client";

// Create a new group type configuration. `groupType` is required; `ruleSetId`
// and `autoAddCreator` (defaults to false) are optional.
export async function create(client: JsBaoClient, ruleSetId: string) {
  // #region example
  const config = await client.groupTypeConfigs.create({
    groupType: "team",
    ruleSetId,
    autoAddCreator: true,
  });
  // #endregion example
  return config;
}
