import type { JsBaoClient } from "js-bao-wss-client";

// One document per workspace, shared collaboratively: create the document,
// open it, then grant a teammate read-write access. Every member sees the full
// contents; Yjs merges concurrent edits.
export async function createWorkspaceDocument(client: JsBaoClient) {
  // #region example
  const { metadata } = await client.documents.create({
    title: "Project Alpha",
    tags: ["workspace"],
  });
  await client.documents.open(metadata.documentId);

  await client.documents.updatePermissions(metadata.documentId, {
    email: "alice@example.com",
    permission: "read-write",
  });
  // #endregion example
  return metadata;
}
