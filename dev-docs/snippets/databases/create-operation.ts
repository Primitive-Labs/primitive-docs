import type { JsBaoClient } from "js-bao-wss-client";

// Create a new named operation (query or mutation) on a database.
export async function createOperation(client: JsBaoClient, databaseId: string) {
  // #region example
  const op = await client.databases.createOperation(databaseId, {
    name: "activeProducts",
    type: "query",
    modelName: "Product",
    access: "authenticated",
    definition: { filter: { status: "active" } },
  });
  // #endregion example
  return op;
}
