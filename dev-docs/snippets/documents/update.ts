import type { JsBaoClient } from "js-bao-wss-client";

// Update document metadata. Replace semantics: omit a key to leave it
// unchanged, pass `null` to clear it.
export async function update(client: JsBaoClient, documentId: string) {
  // #region example
  const info = await client.documents.update(documentId, {
    title: "Q3 Roadmap (final)",
    metadata: { color: "green" },
  });
  // #endregion example
  return info;
}
