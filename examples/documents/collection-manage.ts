import type { JsBaoClient } from "js-bao-wss-client";

// Group documents into a collection and share them as a unit. Permissions on a
// collection are additive (max-wins) and fan out to every document inside it.
export async function manageCollection(
  client: JsBaoClient,
  documentId: string,
  targetUserId: string,
) {
  // #region example
  // Create
  const collection = await client.collections.create({
    name: "Q1 Reports",
    description: "All quarterly report documents",
  });

  // Add / remove documents
  await client.collections.addDocument(collection.collectionId, documentId);
  await client.collections.removeDocument(collection.collectionId, documentId);

  // Share with a group (fans out to every document in the collection)
  await client.collections.grantGroupPermission(collection.collectionId, {
    groupType: "team",
    groupId: "engineering",
    permission: "read-write",
  });

  // Share with an individual user (O(1)). userId only — no email form.
  await client.collections.addMember(collection.collectionId, {
    userId: targetUserId,
    permission: "reader",
  });
  // #endregion example
  return collection;
}
