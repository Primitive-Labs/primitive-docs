import type { JsBaoClient } from "js-bao-wss-client";

// Databases are schemaless. List the models (collections) a database has seen
// via the raw records endpoint. Returns { models: ["contacts", "orders", ...] }.
export async function listModels(client: JsBaoClient, databaseId: string) {
  // #region example
  const { models } = await client.makeRequest(
    "GET",
    `/databases/${databaseId}/records/models`,
  );
  // models: ["contacts", "orders", "products"]
  // #endregion example
  return models;
}
