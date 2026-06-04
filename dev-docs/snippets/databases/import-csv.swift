import JsBaoClient

// Import data from a CSV string into a database, with column mapping, type
// coercion, and a progress callback — mirrors the JS rich CSV pipeline.
func importCsv(client: JsBaoClient, databaseId: String, csv: String) async throws {
  // #region example
  let result = try await client.databases.importCsv(
    databaseId: databaseId,
    options: CsvImportOptions(
      csv: csv,
      modelName: "Product",
      columnMap: ["Product Name": "name"],
      types: ["price": .number],
      onProgress: { progress in
        print(progress.processed, "/", progress.total)
      }
    )
  )
  // #endregion example
  _ = result
}
