import type { JsBaoClient } from "js-bao-wss-client";

// Replace N per-id integration calls with ONE call to the provider's bulk
// endpoint. The integration's TOML must allow the bulk path and forward the
// query param (e.g. `forwardQueryParams = ["symbols"]`).
export async function fetchQuotes(client: JsBaoClient, symbols: string[]) {
  // #region example
  const response = await client.integrations.call({
    integrationKey: "yahoo-finance",
    method: "GET",
    path: "/v7/finance/quote",
    query: { symbols: symbols.join(",") },
  });
  // #endregion example
  return response;
}
