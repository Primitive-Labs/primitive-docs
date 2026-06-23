import JsBaoClient

// Build an authenticated download URL for a document blob. The URL is
// authenticated via the user's session against the API origin. The endpoint
// chooses Content-Disposition from this `disposition`, not the upload-time value.
func buildDownloadUrl(
  client: JsBaoClient,
  documentId: String,
  blobId: String
) {
  let blobs = client.documents.blobs(documentId: documentId)
  // #region example
  let url = blobs.downloadUrl(
    blobId: blobId,
    disposition: .attachment,            // or .inline
    attachmentFilename: "report.pdf"     // optional override (RFC 5987-encoded)
  )
  // #endregion example
  _ = url
}
