import type { JsBaoClient } from "js-bao-wss-client";

// Get the field schema for a model in a database.
export async function describe(
  client: JsBaoClient,
  databaseId: string,
  modelName: string,
) {
  // #region example
  const fields = await client.databases.describe(databaseId, modelName);
  // #endregion example
  return fields;
}
