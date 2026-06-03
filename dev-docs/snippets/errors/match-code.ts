import type { JsBaoClient } from "js-bao-wss-client";
import { isJsBaoError } from "js-bao-wss-client";

// Match on a specific error code. `code` is the string-literal union
// `JsBaoErrorCode`, so compare it directly against a wire string.
export async function matchCode(client: JsBaoClient, userId: string) {
  // #region example
  try {
    await client.users.getBasic(userId);
  } catch (e) {
    if (isJsBaoError(e) && e.code === "NOT_FOUND") {
      console.warn("no such user; showing empty state");
      return;
    }
    throw e;
  }
  // #endregion example
}
