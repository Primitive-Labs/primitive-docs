import type { JsBaoClient } from "js-bao-wss-client";

// Operations that scope data to the calling user via $user.userId. The server
// stamps ownerId and assigns the record id — never trust a caller-supplied id.
export async function userScopedItems(client: JsBaoClient, dbId: string) {
  // #region example
  // Each user only sees their own items (the operation filters on $user.userId).
  const result = await client.databases.executeOperation(dbId, "myItems", {});

  // Creates an item owned by the calling user; server assigns the id.
  const createResult = await client.databases.executeOperation(dbId, "createItem", {
    params: { title: "My Item" },
  });
  const itemId = createResult.results[0].id; // server-assigned ULID
  // #endregion example
  return { result, itemId };
}
