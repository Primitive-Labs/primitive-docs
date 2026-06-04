import Foundation
import JsBaoClient

// Document-scoped upload with an explicit content disposition. `disposition`
// is stored on the blob (sent as X-Blob-Disposition); the download endpoint
// still picks Content-Disposition from its own ?disposition= query param.
func uploadDocumentBlobWithOptions(
  client: JsBaoClient,
  documentId: String
) async throws {
  let blobs = client.documents.blobs(documentId: documentId)
  // #region example
  let data = Data("hello blob".utf8)
  let result = try await blobs.upload(
    data: data,
    options: BlobUploadSourceOptions(
      filename: "hello.txt",
      contentType: "text/plain",
      disposition: .attachment  // or .inline
    )
  )
  let blobId = result.blobId
  let numBytes = result.numBytes
  // #endregion example
  _ = (blobId, numBytes)
}
