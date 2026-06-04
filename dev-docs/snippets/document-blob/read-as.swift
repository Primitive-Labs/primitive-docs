import Foundation
import JsBaoClient

struct Settings: Decodable {
  let theme: String
}

func readAs(
  client: JsBaoClient,
  documentId: String,
  blobId: String
) async throws {
  // #region example
  let blobs = client.documents.blobs(documentId: documentId)
  // Read a blob decoded as UTF-8 text.
  let text: String = try await blobs.read(blobId: blobId, as: String.self)
  // Or JSON-decode it straight into a Decodable type. `force: true` bypasses
  // the local cache and re-downloads.
  let settings: Settings = try await blobs.read(
    blobId: blobId,
    as: Settings.self,
    force: true
  )
  // #endregion example
  _ = (text, settings)
}
