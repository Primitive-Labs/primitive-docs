import type { JsBaoClient } from "js-bao-wss-client";

// Documents the user owns (created them, or had ownership transferred to them).
export async function listOwnedDocuments(client: JsBaoClient) {
  // #region example
  // Paginated page — the unified { items, cursor } envelope, same shape as
  // sharedDocuments():
  const page = await client.me.ownedDocuments({
    tag: "channel",
    returnPage: true,
  });
  const { items, cursor } = page;

  // (Without `returnPage`, the JS client returns a flat `DocumentInfo[]` for
  // convenience: `const owned = await client.me.ownedDocuments({ tag: "channel" })`.)
  // #endregion example
  return { items, cursor };
}
