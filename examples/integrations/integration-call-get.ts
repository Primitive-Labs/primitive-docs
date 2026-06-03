import type { JsBaoClient } from "js-bao-wss-client";

// Proxy a GET request to an external API through a configured integration.
export async function callIntegrationGet(client: JsBaoClient) {
  // #region example
  const response = await client.integrations.call({
    integrationKey: "weather-api",
    method: "GET",
    path: "/forecast/san-francisco",
    query: { units: "metric" },
  });
  console.log(response.status, response.body);
  // #endregion example
  return response;
}
