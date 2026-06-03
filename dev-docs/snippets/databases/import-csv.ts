import type { JsBaoClient } from "js-bao-wss-client";

// Import data from a CSV string into a database.
// JS-only rich pipeline — Swift offers only the pre-parsed `importRows` helper.
export async function importCsv(
  client: JsBaoClient,
  databaseId: string,
  csv: string,
) {
  // #region example
  const result = await client.databases.importCsv(databaseId, {
    csv,
    modelName: "Product",
    columnMap: { "Product Name": "name" },
    types: { price: "number" },
    onProgress: (progress) => console.log(progress.processed, "/", progress.total),
  });
  // #endregion example
  return result;
}
