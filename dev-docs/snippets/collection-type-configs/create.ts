import type { JsBaoClient } from "js-bao-wss-client";

// Create a new collection type configuration. `collectionType` is required;
// `ruleSetId` is optional.
export async function create(client: JsBaoClient, ruleSetId: string) {
  // #region example
  const config = await client.collectionTypeConfigs.create({
    collectionType: "class-students",
    ruleSetId,
  });
  // #endregion example
  return config;
}
