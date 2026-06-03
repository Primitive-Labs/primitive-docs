import type { JsBaoClient } from "js-bao-wss-client";

// Resolve an alias to a document, creating one if the alias doesn't exist yet.
export async function getOrCreateWithAlias(client: JsBaoClient) {
  // #region example
  const result = await client.documents.getOrCreateWithAlias({
    title: "User Notes",
    alias: { scope: "user", aliasKey: "notes" },
    tags: ["scratch"],
  });
  // #endregion example
  return result; // result.created is true when a new doc was made
}
