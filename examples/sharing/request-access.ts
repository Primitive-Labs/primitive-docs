import type { JsBaoClient } from "js-bao-wss-client";

// Access-request flow: a user with a link requests access; an owner reviews.
export async function accessRequests(
  client: JsBaoClient,
  documentId: string,
  requestId: string,
) {
  // #region example
  // A user with the link requests access
  await client.documents.requestAccess(documentId, {
    permission: "read-write",
    message: "Please add me to this doc",
  });

  // An owner lists pending requests and approves one
  const requests = await client.documents.listAccessRequests(documentId);
  await client.documents.approveAccessRequest(documentId, requestId);
  // #endregion example
  return requests;
}
