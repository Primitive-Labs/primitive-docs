import type { JsBaoClient } from "js-bao-wss-client";

// List every document the group has access to, with the granted permission.
export async function listDocuments(
  client: JsBaoClient,
  groupType: string,
  groupId: string,
) {
  // #region example
  const docs = await client.groups.listDocuments(groupType, groupId);
  for (const doc of docs) {
    console.log(doc.documentId, doc.title, doc.permission);
  }
  // #endregion example
  return docs;
}
