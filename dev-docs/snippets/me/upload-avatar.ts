import type { JsBaoClient } from "js-bao-wss-client";

// Upload an avatar image and get back the new avatar URL. `contentType` is a
// typed union of the allowed MIME types.
export async function uploadAvatar(client: JsBaoClient, image: Blob) {
  // #region example
  const { avatarUrl } = await client.me.uploadAvatar(image, "image/png");
  // #endregion example
  return avatarUrl;
}
