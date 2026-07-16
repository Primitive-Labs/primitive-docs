// no-parity — notifications is a JS-client-only capability (no Swift API yet).
import type { JsBaoClient } from "js-bao-wss-client";

// Register the current device for push, so `send()` can reach it over the
// "ios" / "android" channels in addition to the in-app inbox.
export async function registerForPush(client: JsBaoClient, deviceToken: string) {
  // #region example
  const device = await client.notifications.registerDevice({
    token: deviceToken,
    platform: "ios",
    environment: "production",
    bundleId: "com.example.myapp",
  });

  console.log(device.tokenSuffix); // last 8 chars only — the full token is never echoed back
  // #endregion example
  return device;
}
