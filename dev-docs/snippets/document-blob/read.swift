import Foundation
import JsBaoClient

func read(
  client: JsBaoClient,
  documentId: String,
  blobId: String
) async throws {
  // #region example
  let blobs = client.documents.blobs(documentId: documentId)
  // Swift returns raw `Data` (no `as` format options).
  let bytes: Data = try await blobs.read(blobId: blobId)
  let text = String(data: bytes, encoding: .utf8)
  // #endregion example
  _ = (bytes, text)
}
