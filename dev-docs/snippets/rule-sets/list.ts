import type { JsBaoClient } from "js-bao-wss-client";

// List rule sets, optionally filtered via a typed `ListRuleSetsOptions` object.
export async function list(client: JsBaoClient) {
  // #region example
  const ruleSets = await client.ruleSets.list({ resourceType: "document" });
  // #endregion example
  return ruleSets;
}
