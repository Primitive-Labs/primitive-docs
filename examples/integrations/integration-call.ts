import type { JsBaoClient } from "js-bao-wss-client";

// Call an external API through a configured integration (server-side proxy).
export async function callIntegration(client: JsBaoClient) {
  // #region example
  const response = await client.integrations.call({
    integrationKey: "crm-api",
    method: "POST",
    path: "/contacts",
    body: { email: "user@example.com", name: "Alice" },
  });
  // #endregion example
  return response;
}
