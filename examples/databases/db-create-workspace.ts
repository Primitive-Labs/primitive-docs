import type { JsBaoClient } from "js-bao-wss-client";

// Create a database and a matching group (workspace convention: the group id
// is the database id).
export async function createWorkspace(client: JsBaoClient, userId: string) {
  // #region example
  // Create the database (the server assigns the id)
  const db = await client.databases.create({
    title: "Team Workspace",
    databaseType: "workspace",
  });

  // Reuse the database id as the group id, then add the first member
  await client.groups.create({
    groupType: "workspace",
    groupId: db.databaseId,
    name: "Team Workspace Members",
  });
  await client.groups.addMember("workspace", db.databaseId, { userId });
  // #endregion example
  return db;
}
