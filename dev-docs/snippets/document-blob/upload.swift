import Foundation
import JsBaoClient

func upload(
  client: JsBaoClient,
  documentId: String,
  data: Data
) async throws {
  // #region example
  let blobs = client.documents.blobs(documentId: documentId)
  let result = try await blobs.upload(
    data: data,
    options: BlobUploadSourceOptions(
      filename: "notes.txt",
      contentType: "text/plain",
      disposition: .attachment  // or .inline
    )
  )
  let blobId = result.blobId
  let numBytes = result.numBytes
  let contentType = result.contentType
  // #endregion example
  _ = (blobId, numBytes, contentType)
}
