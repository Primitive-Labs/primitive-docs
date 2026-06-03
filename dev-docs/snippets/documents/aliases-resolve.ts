import type { JsBaoClient } from "js-bao-wss-client";

// Resolve an alias to its document (null if not found).
export async function aliasesResolve(client: JsBaoClient) {
  // #region example
  const alias = await client.documents.aliases.resolve({
    scope: "user",
    aliasKey: "notes",
  });
  // #endregion example
  return alias?.documentId ?? null;
}
