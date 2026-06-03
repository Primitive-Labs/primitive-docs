import type { JsBaoClient } from "js-bao-wss-client";

// Update a database's title or type.
export async function update(client: JsBaoClient, databaseId: string) {
  // #region example
  const db = await client.databases.update(databaseId, {
    title: "Renamed catalog",
  });
  // #endregion example
  return db;
}
