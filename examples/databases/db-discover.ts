import type { JsBaoClient } from "js-bao-wss-client";

// Discover databases shared via groups (workspace convention: groupId == databaseId).
export async function discoverWorkspaceDatabases(client: JsBaoClient, userId: string) {
  // #region example
  const memberships = await client.groups.listUserMemberships(userId);
  const workspaces = memberships.filter((m) => m.groupType === "workspace");

  // Each group id is also the database id — load them
  const databases = await Promise.all(
    workspaces.map((g) => client.databases.get(g.groupId)),
  );
  // #endregion example
  return databases;
}
