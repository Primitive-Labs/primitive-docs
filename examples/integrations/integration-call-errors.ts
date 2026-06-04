import type { JsBaoClient } from "js-bao-wss-client";
import { isJsBaoError } from "js-bao-wss-client";

// Call an integration and branch on the typed error code on failure.
export async function callIntegrationWithErrorHandling(client: JsBaoClient) {
  // #region example
  try {
    await client.integrations.call({
      integrationKey: "crm",
      method: "POST",
      path: "/contacts",
      body: { email: "user@example.com" },
    });
  } catch (error) {
    if (isJsBaoError(error)) {
      switch (error.code) {
        case "INTEGRATION_NOT_FOUND":
          break; // 404, also fires for status != active
        case "INTEGRATION_SECRET_MISSING":
          break; // 409, MISSING_SECRET upstream
        case "INTEGRATION_REQUEST_INVALID":
          break; // 400/413/422 (method/path/body)
        case "INTEGRATION_PROXY_FAILED":
          break; // upstream timeout/network/malformed
        case "ACCESS_DENIED":
          break; // 401/403 (client auth)
        case "INVALID_ARGUMENT":
          break; // missing integrationKey
        case "OFFLINE":
          break; // SDK in offline mode
      }
    }
  }
  // #endregion example
}
