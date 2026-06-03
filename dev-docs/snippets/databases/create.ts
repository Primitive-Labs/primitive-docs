import type { JsBaoClient } from "js-bao-wss-client";

// Create a new database of a given type.
export async function create(client: JsBaoClient, databaseType: string) {
  // #region example
  const db = await client.databases.create({
    title: "Product catalog",
    databaseType,
    celContext: { region: "us-east" },
  });
  // #endregion example
  return db;
}
