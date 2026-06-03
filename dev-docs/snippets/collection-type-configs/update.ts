import type { JsBaoClient } from "js-bao-wss-client";

// Update a collection type configuration's rule set. Pass `null` to remove the
// current rule set.
export async function update(
  client: JsBaoClient,
  collectionType: string,
  ruleSetId: string,
) {
  // #region example
  const config = await client.collectionTypeConfigs.update(collectionType, {
    ruleSetId,
  });
  // #endregion example
  return config;
}
