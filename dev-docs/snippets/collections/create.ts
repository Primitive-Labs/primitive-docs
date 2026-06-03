import type { JsBaoClient } from "js-bao-wss-client";

// Create a new collection. `name` is required; `collectionType`/`contextId`
// are immutable after create.
export async function create(client: JsBaoClient) {
  // #region example
  const collection = await client.collections.create({
    name: "Q3 Planning",
    description: "Docs for the Q3 planning cycle",
    collectionType: "default",
  });
  // #endregion example
  return collection;
}
