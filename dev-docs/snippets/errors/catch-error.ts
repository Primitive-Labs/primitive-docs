import type { JsBaoClient } from "js-bao-wss-client";
import { isJsBaoError } from "js-bao-wss-client";

// Catch a JsBaoError thrown by a client call and read its `code`.
// `isJsBaoError` narrows the caught value to JsBaoError.
export async function catchError(client: JsBaoClient, userId: string) {
  // #region example
  try {
    await client.users.getBasic(userId);
  } catch (e) {
    if (isJsBaoError(e)) {
      console.error("client error:", e.code, e.message);
    } else {
      throw e;
    }
  }
  // #endregion example
}
