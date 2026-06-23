import Foundation
import JsBaoClient

// Read a document blob into memory with the typed `read` overloads. Reads check
// the local cache first; on a miss they fetch from the server and cache the
// response. Pass `force: true` to bypass the cache and re-fetch.
func readDocumentBlobFormats(
  client: JsBaoClient,
  documentId: String,
  blobId: String
) async throws {
  let blobs = client.documents.blobs(documentId: documentId)
  // #region example
  let bytes = try await blobs.read(blobId: blobId)                 // Data
  let text = try await blobs.read(blobId: blobId, as: String.self) // UTF-8 String

  // Bypass the local cache and re-fetch from the server.
  let fresh = try await blobs.read(blobId: blobId, as: String.self, force: true)
  // #endregion example
  _ = (bytes, text, fresh)
}
