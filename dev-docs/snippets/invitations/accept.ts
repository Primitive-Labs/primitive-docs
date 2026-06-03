import type { JsBaoClient } from "js-bao-wss-client";

// Accept an invitation via its invite token. Marks the invitation accepted
// (write-once) and resolves any linked deferred grants to the caller. Returns a
// typed `AcceptInviteResult` including how many grants resolved.
export async function accept(client: JsBaoClient, inviteToken: string) {
  // #region example
  const result = await client.invitations.accept(inviteToken);
  const groupsResolved = result.grantsResolved.groups;
  const documentsResolved = result.grantsResolved.documents;
  // #endregion example
  return { groupsResolved, documentsResolved };
}
