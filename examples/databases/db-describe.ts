import type { JsBaoClient } from "js-bao-wss-client";

// Databases are schemaless — the system tracks fields and inferred types as
// records are written. describe() returns a model's observed field schema.
export async function describeModel(client: JsBaoClient, databaseId: string) {
  // #region example
  const fields = await client.databases.describe(databaseId, "products");
  // [{ model_name: "products", field_name: "name", inferred_type: "string", first_seen_at: "..." }]
  // #endregion example
  return fields;
}
