import JsBaoClient

// Supplement — don't replace — the platform user. Store app-specific user data
// keyed by the platform userId, either in a document or via a database
// operation that resolves the caller server-side as $user.userId.
func supplementUserData(
  client: JsBaoClient,
  platformUserId: String,
  userDocumentId: String,
  dbId: String
) async throws {
  // #region example
  // Store additional user data in a document, keyed by the platform userId.
  let profile = AppUser(
    id: platformUserId, // reference the platform user
    email: "alice@example.com",
    name: "Software engineer"
  )
  try profile.save(in: userDocumentId)

  // Or in a database via a registered operation. The operation uses
  // $user.userId server-side — no need to pass the userId yourself.
  _ = try await client.databases.executeOperation(
    databaseId: dbId, name: "updateProfile",
    options: ExecuteOperationOptions(params: ["bio": "Software engineer", "theme": "dark"])
  )
  // #endregion example
}
