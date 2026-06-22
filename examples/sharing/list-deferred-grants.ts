import type { JsBaoClient } from "js-bao-wss-client";

// Inspect pending deferred grants for an email (admin/debug only). End-user
// "people with access + pending" UI uses the per-resource endpoints instead.
export async function inspectDeferredGrants(client: JsBaoClient) {
  // #region example
  const { grants, nextCursor } = await client.invitations.listDeferredGrants({
    email: "alice@example.com",
  });
  // #endregion example
  return { grants, nextCursor };
}
