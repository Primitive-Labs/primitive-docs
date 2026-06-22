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

// Deny a request instead, optionally pointing the requester at the doc's URL.
export async function denyRequest(
  client: JsBaoClient,
  documentId: string,
  requestId: string,
) {
  // #region deny
  await client.documents.denyAccessRequest(documentId, requestId, {
    documentUrl: "https://myapp.example/docs/sales-handbook",
  });
  // #endregion deny
}
