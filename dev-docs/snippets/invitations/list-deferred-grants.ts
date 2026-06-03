import type { JsBaoClient } from "js-bao-wss-client";

// List pending deferred grants (admin/owner only) — permissions/memberships
// created for users who haven't signed up yet. Each grant is a typed
// `DeferredGrant` union discriminated on `type` ("document" | "group").
export async function listDeferredGrants(client: JsBaoClient) {
  // #region example
  const result = await client.invitations.listDeferredGrants({
    type: "document",
    limit: 25,
  });
  for (const grant of result.grants) {
    if (grant.type === "document") {
      console.log(grant.documentId, grant.permission);
    }
  }
  const nextCursor = result.nextCursor;
  // #endregion example
  return nextCursor;
}
