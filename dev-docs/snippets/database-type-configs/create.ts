import type { JsBaoClient } from "js-bao-wss-client";

// Create a new database type configuration. `databaseType` is required;
// `ruleSetId`, `triggers`, and `metadataAccess` are optional.
export async function create(client: JsBaoClient, ruleSetId: string) {
  // #region example
  const config = await client.databaseTypeConfigs.create({
    databaseType: "userDB",
    ruleSetId,
    triggers: {
      Task: { triggers: [{ on: "create", set: { status: "open" } }] },
    },
    metadataAccess: "user.role == 'admin'",
  });
  // #endregion example
  return config;
}
