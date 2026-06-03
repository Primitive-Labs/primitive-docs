import type { JsBaoClient } from "js-bao-wss-client";

// Update a document's presentation fields: title, thumbnail, and metadata.
export async function updateMetadata(client: JsBaoClient, documentId: string, blobId: string) {
  // #region example
  await client.documents.update(documentId, {
    title: "Q2 Planning",
    thumbnailBlobId: blobId,                              // a blob you uploaded
    metadata: { color: "blue", tags: ["plan", "q2"] },   // ≤4KB JSON, replace semantics
  });
  // #endregion example
}
