import type { JsBaoClient } from "js-bao-wss-client";

// Remove a member by id, or by email. The email form also cancels a pending
// deferred add for someone who was invited but hasn't signed up yet.
export async function removeGroupMember(client: JsBaoClient) {
  // #region example
  // By user ID
  await client.groups.removeMember("team", "engineering", "user-456");

  // By email — removes a direct membership if one exists, otherwise cancels
  // the pending DeferredGroupAdd for that email.
  await client.groups.removeMember("team", "engineering", {
    email: "alice@example.com",
  });
  // #endregion example
}
