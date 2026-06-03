import type { JsBaoClient } from "js-bao-wss-client";

// Call an integration and read the structured proxy response fields.
export async function callIntegrationWithResponse(client: JsBaoClient) {
  // #region example
  const response = await client.integrations.call({
    integrationKey: "open-ai",
    method: "POST",
    path: "/v1/responses",
    body: { model: "gpt-4.1-mini", input: "hi" },
  });

  console.log(response.status); // upstream HTTP status (number)
  console.log(response.headers); // Record<string, string>
  console.log(response.body); // upstream body, parsed if JSON
  console.log(response.traceId); // optional, correlates with admin logs
  console.log(response.durationMs); // optional, proxy-side duration
  console.log(response.errorCode); // optional, set when status >= 400
  // #endregion example
  return response;
}
