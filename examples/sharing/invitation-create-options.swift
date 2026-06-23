import Foundation
import JsBaoClient

// Create invitations: any role (admin/owner), full options, and the
// member path that gates on quota first.
func createInvitationOptions(client: JsBaoClient, email: String) async throws {
  // #region example
  // Admins/owners: any role
  _ = try await client.invitations.create(
    params: CreateInvitationParams(
      email: "alice@example.com",
      role: "member" // or "admin" / "owner" (admin/owner only)
    )
  )

  // Full options
  let expiresAt = ISO8601DateFormatter().string(from: Date().addingTimeInterval(7 * 86400))
  _ = try await client.invitations.create(
    params: CreateInvitationParams(
      email: "alice@example.com",
      role: "member",
      expiresAt: expiresAt, // optional override
      source: "team-onboarding-flow",
      note: "Backend hire — Q2 cohort",
      sendEmail: true
    )
  )

  // Members: gate on quota first
  let quota = try await client.invitations.quota()
  if !quota.unlimited && quota.remaining <= 0 {
    return // quota exhausted — hide the invite UI
  }
  _ = try await client.invitations.create(
    params: CreateInvitationParams(email: email, role: "member")
  )
  // #endregion example
}
