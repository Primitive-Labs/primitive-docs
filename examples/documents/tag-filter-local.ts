import type { JsBaoClient } from "js-bao-wss-client";

// Create a tagged document, then filter the owned list locally by tag.
export async function tagFilterLocal(client: JsBaoClient) {
  // #region example
  const { metadata } = await client.documents.create({
    title: "My List",
    tags: ["todolist"],
  });

  // Filter locally
  const owned = await client.me.ownedDocuments();
  const todoLists = owned.filter((doc) => doc.tags?.includes("todolist"));
  // #endregion example
  return { metadata, todoLists };
}
