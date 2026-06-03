import type { JsBaoClient } from "js-bao-wss-client";

// List groups, optionally filtered by type. Returns a paginated envelope.
export async function list(client: JsBaoClient) {
  // #region example
  const page = await client.groups.list({ type: "team", limit: 20 });
  for (const group of page.items) {
    console.log(group.groupId, group.name, group.memberCount);
  }
  const nextCursor = page.cursor;
  // #endregion example
  return nextCursor;
}
