import type { JsBaoClient } from "js-bao-wss-client";
import { isJsBaoError } from "js-bao-wss-client";

// Read structured diagnostics off `error.details`. In JS this is `any` and
// carries heterogeneous values (numbers, nested objects, booleans).
export async function readDetails(client: JsBaoClient, userId: string) {
  // #region example
  try {
    await client.users.getBasic(userId);
  } catch (e) {
    if (isJsBaoError(e) && e.details) {
      const status = e.details.status as number | undefined;
      console.error("failed with status", status, e.details);
    }
  }
  // #endregion example
}
