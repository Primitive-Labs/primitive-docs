import type { JsBaoClient } from "js-bao-wss-client";

// Atomic get-or-create of a per-user singleton document, then open it.
export async function getOrCreateLibrary(client: JsBaoClient) {
  // #region example
  const result = await client.documents.getOrCreateWithAlias({
    title: "My Data",
    alias: { scope: "user", aliasKey: "default-doc" },
  });
  await client.documents.open(result.documentId);
  // #endregion example
  return result;
}
