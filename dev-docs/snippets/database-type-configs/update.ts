import type { JsBaoClient } from "js-bao-wss-client";

// Update an existing database type configuration. Pass `null` for any field
// to clear it; omit a field to leave it unchanged.
export async function update(
  client: JsBaoClient,
  databaseType: string,
  ruleSetId: string,
) {
  // #region example
  const config = await client.databaseTypeConfigs.update(databaseType, {
    ruleSetId,
    triggers: null,
    metadataAccess: "user.role == 'admin'",
  });
  // #endregion example
  return config;
}
