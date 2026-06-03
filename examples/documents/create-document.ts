import type { JsBaoClient } from "js-bao-wss-client";

// Create a new (non-singleton) document with tags, then open it so it can be
// queried and written to. `create()` returns the new document's metadata.
export async function createWorkspace(client: JsBaoClient) {
  // #region example
  const { metadata } = await client.documents.create({
    title: "New Project",
    tags: ["workspace"],
  });
  await client.documents.open(metadata.documentId);
  // #endregion example
  return metadata.documentId;
}
