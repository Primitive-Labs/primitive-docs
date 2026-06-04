import Foundation
import JsBaoClient

func uploadFile(
  client: JsBaoClient,
  documentId: String,
  data: Data
) async throws {
  // #region example
  let blobs = client.documents.blobs(documentId: documentId)
  // Like upload(), but returns the narrowed queue shape ({ blobId, numBytes,
  // bytesTransferred }) and queues for background transfer when the immediate
  // upload can't complete.
  let result = try await blobs.uploadFile(
    data: data,
    options: BlobUploadSourceOptions(
      filename: "large.bin",
      contentType: "application/octet-stream"
    )
  )
  let blobId = result.blobId
  let numBytes = result.numBytes
  // #endregion example
  _ = (blobId, numBytes)
}
