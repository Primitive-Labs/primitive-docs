import type { JsBaoClient } from "js-bao-wss-client";

// Retrieve the rule set schema describing available resource types.
export async function schema(client: JsBaoClient) {
  // #region example
  const schema = await client.ruleSets.schema();
  // #endregion example
  return schema;
}
