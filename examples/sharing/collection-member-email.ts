import type { JsBaoClient } from "js-bao-wss-client";

// Collections accept email-based members exactly like documents and groups —
// a deferred grant that resolves on signup.
export async function addCollectionMembers(
  client: JsBaoClient,
  collectionId: string
) {
  // #region example
  // Add an individual member by userId
  await client.collections.addMember(collectionId, {
    userId: "user-abc",
    permission: "read-write", // "reader" or "read-write"
  });

  // Or by email — deferred grant resolves on signup
  const result = await client.collections.addMember(collectionId, {
    email: "newhire@example.com",
    permission: "reader",
    sendEmail: true, // optional: platform sends an invite email
    collectionUrl: "https://app.example.com/onboarding", // required when sendEmail is true
    note: "Sharing the onboarding docs",
  });
  // result.status: "added" | "already_member" | "pending_signup"
  // Pending case carries { invitationId, inviteToken, expiresAt }.
  // #endregion example
  return result;
}
