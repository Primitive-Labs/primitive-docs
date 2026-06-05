import Foundation
import JsBaoClient

// Bulk-load CSV rows through the database's registered save operation, with
// column mapping, type coercion, per-row transforms, and progress callbacks.
func importProducts(
  client: JsBaoClient,
  databaseId: String,
  csvString: String
) async throws {
  // #region example
  let result = try await client.databases.importCsv(
    databaseId: databaseId,
    options: CsvImportOptions(
      csv: csvString, // provide csv or data (pre-parsed rows), not both
      modelName: "products",
      columnMap: ["Product Name": "name", "Unit Price": "price"],
      transform: { row, _ in
        guard let name = row["name"]?.stringValue, !name.isEmpty else {
          return nil // return nil to skip a row
        }
        var out = row
        out["importedAt"] = .string(ISO8601DateFormatter().string(from: Date()))
        return out
      },
      types: ["price": .number],
      idColumn: "sku",
      onProgress: { progress in
        print("\(progress.processed)/\(progress.total) processed")
      }
    )
  )
  // CsvImportResult: imported, failed, errors, indexesCreated, durationMs
  // #endregion example
  _ = result
}
