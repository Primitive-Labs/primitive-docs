import type { JsBaoClient } from "js-bao-wss-client";

// Add a user to a group by userId OR email (mutually exclusive). The result is
// a discriminated union: a direct add, an idempotent "already member", or a
// deferred "pending signup" when the email has no app user yet.
export async function addMember(
  client: JsBaoClient,
  groupType: string,
  groupId: string,
  email: string,
) {
  // #region example
  const result = await client.groups.addMember(groupType, groupId, { email });
  if (result.status === "pending_signup") {
    // Email has no app user yet — a deferred add was created.
    console.log("Invitation pending:", result.deferredId, result.inviteToken);
  } else {
    // "added" or "already_member"
    console.log(result.status, result.userId, result.addedAt);
  }
  // #endregion example
  return result;
}
