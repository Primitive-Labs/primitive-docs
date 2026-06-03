import type { JsBaoClient } from "js-bao-wss-client";

// Update a group type configuration's rule set or auto-add-creator setting.
// Pass `null` for `ruleSetId` to remove the current rule set.
export async function update(
  client: JsBaoClient,
  groupType: string,
  ruleSetId: string,
) {
  // #region example
  const config = await client.groupTypeConfigs.update(groupType, {
    ruleSetId,
    autoAddCreator: false,
  });
  // #endregion example
  return config;
}
