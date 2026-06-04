import Foundation
import JsBaoClient

func read(
  client: JsBaoClient,
  documentId: String,
  blobId: String
) async throws {
  // #region example
  let blobs = client.documents.blobs(documentId: documentId)
  // Base read returns raw `Data`. Pass `force: true` to bypass the cache.
  let bytes: Data = try await blobs.read(blobId: blobId)
  let text = String(data: bytes, encoding: .utf8)
  // #endregion example
  _ = (bytes, text)
}
