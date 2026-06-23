import type { JsBaoClient } from "js-bao-wss-client";

// Create invitations: any role (admin/owner), full options, and the
// member path that gates on quota first.
export async function createInvitationOptions(client: JsBaoClient, email: string) {
  // #region example
  // Admins/owners: any role
  await client.invitations.create({
    email: "alice@example.com",
    role: "member", // or "admin" / "owner" (admin/owner only)
  });

  // Full options
  await client.invitations.create({
    email: "alice@example.com",
    role: "member",
    expiresAt: new Date(Date.now() + 7 * 86400_000).toISOString(), // optional override
    source: "team-onboarding-flow",
    note: "Backend hire — Q2 cohort",
    sendEmail: true,
  });

  // Members: gate on quota first
  const quota = await client.invitations.quota();
  if (!quota.unlimited && quota.remaining <= 0) {
    return; // quota exhausted — hide the invite UI
  }
  await client.invitations.create({ email, role: "member" });
  // #endregion example
}
