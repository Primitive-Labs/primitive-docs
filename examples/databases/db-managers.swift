import JsBaoClient

// Administrative permission management. owner/manager control the database
// itself — NOT end-user data access (that goes through registered operations).
func manageDatabaseAdmins(
  client: JsBaoClient,
  databaseId: String,
  coAdminUserId: String,
  newOwnerId: String
) async throws {
  // #region example
  _ = try await client.databases.addManager(
    databaseId: databaseId,
    params: AddManagerParams(userId: coAdminUserId)
  )

  let permissions = try await client.databases.listPermissions(databaseId: databaseId)
  // [DatabasePermissionEntry { databaseId, userId, permission, grantedAt, grantedBy, userName?, userEmail? }]

  _ = try await client.databases.removeManager(databaseId: databaseId, userId: coAdminUserId)

  _ = try await client.databases.transferOwnership(databaseId: databaseId, newOwnerId: newOwnerId)
  // #endregion example
  _ = permissions
}
