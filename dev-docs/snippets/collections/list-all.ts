import type { JsBaoClient } from "js-bao-wss-client";

// List every collection in the app (admin-only). Unlike `list()`, items do
// NOT carry a `permission` field.
export async function listAll(client: JsBaoClient) {
  // #region example
  const page = await client.collections.listAll({ limit: 100 });
  // #endregion example
  return page.items;
}
