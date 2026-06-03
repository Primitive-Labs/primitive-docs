import type { JsBaoClient } from "js-bao-wss-client";

// Connect to a database and get a DoDb instance for ad-hoc record queries.
// JS-only — the Swift client has no record CRUD/query surface.
export function connect(client: JsBaoClient, databaseId: string) {
  // #region example
  const db = client.databases.connect(databaseId);
  // db now exposes record-level query/find/save/patch/count/aggregate.
  // #endregion example
  return db;
}
