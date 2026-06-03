import type { JsBaoClient } from "js-bao-wss-client";

// List collections the caller is a direct member of. Each item carries a
// `permission` field reflecting the caller's direct access level.
export async function list(client: JsBaoClient) {
  // #region example
  const page = await client.collections.list({ limit: 50 });
  for (const collection of page.items) {
    console.log(collection.name, collection.permission);
  }
  // #endregion example
  return page.cursor;
}
