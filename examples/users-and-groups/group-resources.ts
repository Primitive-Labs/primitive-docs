import type { JsBaoClient } from "js-bao-wss-client";

// Inspect what a group can reach, and manage a document's group grants. A
// user's effective permission is the highest across direct + all group grants.
export async function groupResources(client: JsBaoClient, documentId: string) {
  // #region example
  // What the group can access
  const docs = await client.groups.listDocuments("team", "engineering");
  const dbs = await client.groups.listDatabases("team", "engineering");

  // A document's group grants
  const groupPerms = await client.documents.listGroupPermissions(documentId);
  await client.documents.revokeGroupPermission(documentId, "team", "engineering");
  // #endregion example
  return { docs, dbs, groupPerms };
}
