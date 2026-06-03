import type { JsBaoClient } from "js-bao-wss-client";

// Create a new document. `localOnly: true` defers the server commit.
export async function create(client: JsBaoClient) {
  // #region example
  const { metadata } = await client.documents.create({
    title: "Q3 Roadmap",
    tags: ["planning"],
    metadata: { color: "blue" },
  });
  // #endregion example
  return metadata;
}
