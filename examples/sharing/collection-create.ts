import type { JsBaoClient } from "js-bao-wss-client";

// Create a collection, put documents in it, and share the whole set at once.
export async function createCollection(
  client: JsBaoClient,
  designDocId: string,
  specDocId: string,
) {
  // #region example
  // Create a collection and put documents in it
  const collection = await client.collections.create({ name: "Project Phoenix" });
  await client.collections.addDocument(collection.collectionId, designDocId);
  await client.collections.addDocument(collection.collectionId, specDocId);

  // One grant covers the whole set — including documents added later
  await client.collections.addMember(collection.collectionId, {
    email: "alice@example.com",
    permission: "read-write",
  });
  // #endregion example
  return collection;
}
