import type { JsBaoClient } from "js-bao-wss-client";

// GET through a configured integration, with query parameters. The proxy
// applies the integration's defaultHeaders/staticQuery server-side.
export async function getForecast(client: JsBaoClient) {
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
