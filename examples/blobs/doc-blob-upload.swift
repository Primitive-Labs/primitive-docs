import Foundation
import JsBaoClient

// Document-scoped blob: upload a file attached to a document (access follows
// the document's permissions; 10MB cap).
func uploadDocumentBlob(
  client: JsBaoClient,
  documentId: String,
  data: Data
) async throws {
  // #region example
  let blobs = client.documents.blobs(documentId: documentId)
  let result = try await blobs.upload(
    data: data,
    options: BlobUploadSourceOptions(filename: "notes.txt", contentType: "text/plain")
  )
  let blobId = result.blobId
  // #endregion example
  _ = blobId
}
