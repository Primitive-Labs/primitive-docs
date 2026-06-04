import type { JsBaoClient } from "js-bao-wss-client";

// addMember returns a discriminated union — branch on `status`. An email that
// isn't yet an app user produces a deferred add, not a direct membership.
export async function addMemberWithBranching(client: JsBaoClient, email: string) {
  // #region example
  const result = await client.groups.addMember("team", "engineering", { email });

  if (result.status === "added") {
    // New membership: { userId, userName?, userEmail?, addedAt, addedBy }
    console.log("added", result.userId);
  } else if (result.status === "already_member") {
    // Idempotent no-op (replaces the old HTTP 409).
    console.log("already a member");
  } else if (result.status === "pending_signup") {
    // Email isn't an app user yet. The server created an AppInvitation +
    // DeferredGroupAdd: { email, appInvitationCreated, deferredId, expiresAt,
    // groupType, groupId, invitationId, inviteToken }. Use inviteToken to
    // build an accept URL; cancel via revokeDeferredGrant.
    await client.invitations.revokeDeferredGrant(result.deferredId, "group");
  }
  // #endregion example
  return result;
}
