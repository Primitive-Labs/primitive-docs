import type { JsBaoClient } from "js-bao-wss-client";

// Batch-fetch several basic profiles in one round-trip.
export async function getProfiles(client: JsBaoClient, ids: string[]) {
  // #region example
  const profiles = await client.users.getProfiles(ids);
  // #endregion example
  return profiles;
}
