import type { JsBaoClient } from "js-bao-wss-client";

// Bulk-load CSV rows through the database's registered save operation, with
// column mapping, type coercion, per-row transforms, and progress callbacks.
export async function importProducts(
  client: JsBaoClient,
  databaseId: string,
  csvString: string
) {
  // #region example
  const result = await client.databases.importCsv(databaseId, {
    csv: csvString, // provide csv or data (pre-parsed rows), not both
    modelName: "products",
    columnMap: { "Product Name": "name", "Unit Price": "price" },
    types: { price: "number" },
    idColumn: "sku",
    transform: (row, _index) => {
      if (!row.name) return null; // return null to skip a row
      return { ...row, importedAt: new Date().toISOString() };
    },
    onProgress: ({ processed, total }) => {
      console.log(`${processed}/${total} processed`);
    },
  });
  // result: { imported, failed, errors, indexesCreated, durationMs }
  // #endregion example
  return result;
}
