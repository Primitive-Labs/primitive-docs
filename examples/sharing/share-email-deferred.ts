import type { JsBaoClient } from "js-bao-wss-client";

// Share by email with notification — resolves immediately if the user
// exists, otherwise creates a deferred grant that auto-applies when the
// recipient signs up. With `sendEmail: true`, `documentUrl` is required
// AND the app must have `baseUrl` configured (used to compose the accept
// URL for the deferred-share email). Both preconditions return HTTP 400
// if missing.
export async function shareByEmailDeferred(
  client: JsBaoClient,
  documentId: string
) {
  // #region example
  const result = await client.documents.updatePermissions(documentId, {
    email: "alice@example.com",
    permission: "read-write",
    sendEmail: true,
    documentUrl: "https://app.example.com/lists",
  });
  // Returns a direct grant (existing user) or a deferred grant
  // ({ invitationId, inviteToken, ... }) that the recipient redeems via
  // client.invitations.accept(inviteToken) after signup.
  // #endregion example
  return result;
}
