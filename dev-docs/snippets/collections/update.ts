import type { JsBaoClient } from "js-bao-wss-client";

// Update a collection's name or description.
export async function update(client: JsBaoClient, collectionId: string) {
  // #region example
  const collection = await client.collections.update(collectionId, {
    name: "Q3 Planning (final)",
    description: "Frozen for the planning review",
  });
  // #endregion example
  return collection;
}
