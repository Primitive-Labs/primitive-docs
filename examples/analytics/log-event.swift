import JsBaoClient

// Emit a custom analytics event for an app-specific action.
func logPhotoUploaded(client: JsBaoClient, currentUserUlid: String) {
  // #region example
  client.logAnalyticsEvent([
    "action": "photo_uploaded",
    "feature": "gallery",
    "user_ulid": currentUserUlid,
    "context_json": ["resultCount": 42],
  ])
  // #endregion example
}
