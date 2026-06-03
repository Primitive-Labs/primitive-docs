import type { JsBaoClient } from "js-bao-wss-client";

// Categorize documents with tags, then add/remove tags on an existing
// document. Filter the user's owned documents server-side by tag.
export async function tagDocuments(client: JsBaoClient, documentId: string) {
  // #region example
  // Filter the user's owned documents by tag
  const todoLists = await client.me.ownedDocuments({ tag: "todolist" });

  // Add a tag to an existing document
  await client.documents.addTag(documentId, "archived");

  // Remove a tag from a document
  await client.documents.removeTag(documentId, "archived");
  // #endregion example
  return todoLists;
}
