import type { JsBaoClient } from "js-bao-wss-client";
import { AppUser } from "../_harness/generated/ts/AppUser.generated";

// Supplement — don't replace — the platform user. Store app-specific user data
// keyed by the platform userId, either in a document or via a database
// operation that resolves the caller server-side as $user.userId.
export async function supplementUserData(
  client: JsBaoClient,
  platformUserId: string,
  userDocumentId: string,
  dbId: string,
) {
  // #region example
  // Store additional user data in a document, keyed by the platform userId.
  const profile = new AppUser({
    id: platformUserId, // reference the platform user
    email: "alice@example.com",
    name: "Software engineer",
  });
  await profile.save({ targetDocument: userDocumentId });

  // Or in a database via a registered operation. The operation uses
  // $user.userId server-side — no need to pass the userId yourself.
  await client.databases.executeOperation(dbId, "updateProfile", {
    params: { bio: "Software engineer", theme: "dark" },
  });
  // #endregion example
}
