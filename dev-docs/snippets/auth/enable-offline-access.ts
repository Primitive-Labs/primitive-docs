import type { JsBaoClient } from "js-bao-wss-client";

// Enable offline access using a passkey (largeBlob) or PIN-based grant.
export async function enableOfflineAccess(client: JsBaoClient) {
  // #region example
  const { enabled, method } = await client.enableOfflineAccess({
    preferBiometric: true,
    allowPinFallback: true,
    ttlDays: 14,
  });
  // #endregion example
  return { enabled, method };
}
