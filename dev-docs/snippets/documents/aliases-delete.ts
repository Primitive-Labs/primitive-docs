import type { JsBaoClient } from "js-bao-wss-client";

// Delete a document alias.
export async function aliasesDelete(client: JsBaoClient) {
  // #region example
  await client.documents.aliases.delete({ scope: "user", aliasKey: "notes" });
  // #endregion example
}
