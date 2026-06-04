import type { JsBaoClient } from "js-bao-wss-client";

// Administrative permission management. owner/manager control the database
// itself — NOT end-user data access (that goes through registered operations).
export async function manageDatabaseAdmins(
  client: JsBaoClient,
  databaseId: string,
  coAdminUserId: string,
  newOwnerId: string,
) {
  // #region example
  await client.databases.addManager(databaseId, { userId: coAdminUserId });

  const permissions = await client.databases.listPermissions(databaseId);
  // [{ databaseId, userId, permission, grantedAt, grantedBy, userName?, userEmail? }]

  await client.databases.removeManager(databaseId, coAdminUserId);

  await client.databases.transferOwnership(databaseId, newOwnerId);
  // #endregion example
  return permissions;
}
