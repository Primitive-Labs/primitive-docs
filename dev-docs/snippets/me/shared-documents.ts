import type { JsBaoClient } from "js-bao-wss-client";

// List documents shared with the current user. Returns the unified
// `{ items, cursor? }` envelope; pass `tag` to filter, `cursor` to paginate.
export async function sharedDocuments(client: JsBaoClient) {
  // #region example
  const { items, cursor } = await client.me.sharedDocuments({
    limit: 50,
    tag: "shared",
  });
  // #endregion example
  return { items, cursor };
}
