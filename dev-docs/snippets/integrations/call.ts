import type { JsBaoClient } from "js-bao-wss-client";

// Call a third-party integration through the server proxy. `call` is generic,
// so the response `body` is typed `T` and `query` accepts `Record<string, any>`.
export async function call(client: JsBaoClient, integrationKey: string) {
  // #region example
  const response = await client.integrations.call<{ id: string }>({
    integrationKey,
    method: "GET",
    path: "/users/me",
    query: { include: "profile" },
  });
  console.log(response.status, response.body.id);
  // #endregion example
  return response;
}
