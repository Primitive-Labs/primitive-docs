import type { JsBaoClient } from "js-bao-wss-client";

// Documents the user can access via a group they belong to.
export async function listGroupDocuments(client: JsBaoClient) {
  // #region example
  const documents = await client.groups.listDocuments("team", "engineering");
  // #endregion example
  return documents;
}
