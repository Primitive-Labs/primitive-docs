import type { JsBaoClient } from "js-bao-wss-client";

// Create a database instance of a configured database type. The server assigns
// the id and makes the caller its owner.
export async function createDatabase(client: JsBaoClient) {
  // #region example
  const db = await client.databases.create({
    title: "Alpha Project",
    databaseType: "project", // must match a configured database type
  });
  // db: { databaseId, title, databaseType, celContext, permission, createdBy, ... }
  // #endregion example
  return db;
}
