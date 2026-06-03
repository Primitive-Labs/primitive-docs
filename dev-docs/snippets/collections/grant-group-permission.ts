import type { JsBaoClient } from "js-bao-wss-client";

// Grant a group a permission level on a collection.
export async function grantGroupPermission(
  client: JsBaoClient,
  collectionId: string,
) {
  // #region example
  const grant = await client.collections.grantGroupPermission(collectionId, {
    groupType: "team",
    groupId: "eng",
    permission: "read-write",
  });
  // #endregion example
  return grant;
}
