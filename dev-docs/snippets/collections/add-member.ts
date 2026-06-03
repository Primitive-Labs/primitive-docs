import type { JsBaoClient } from "js-bao-wss-client";

// Add a member by userId or email (mutually exclusive). Returns a
// discriminated union keyed on `status`.
export async function addMember(client: JsBaoClient, collectionId: string) {
  // #region example
  const result = await client.collections.addMember(collectionId, {
    email: "teammate@example.com",
    permission: "read-write",
    sendEmail: true,
  });

  if (result.status === "pending_signup") {
    // Email not yet an app user — a deferred invite was created.
    console.log(result.invitationId, result.inviteToken);
  } else {
    // "added" or "already_member" — a real membership exists.
    console.log(result.userId, result.permission);
  }
  // #endregion example
  return result;
}
