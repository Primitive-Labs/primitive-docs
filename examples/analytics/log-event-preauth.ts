import type { JsBaoClient } from "js-bao-wss-client";
import { ANALYTICS_UNAUTHENTICATED_USER } from "js-bao-wss-client";

// Track activity before sign-in. Events without an authenticated user are
// dropped, so pass the unauthenticated-user constant for landing/sign-up flows.
export function logLandingView(client: JsBaoClient) {
  // #region example
  client.analytics.logEvent({
    action: "landing_page_view",
    feature: "onboarding",
    user_ulid: ANALYTICS_UNAUTHENTICATED_USER,
  });
  // #endregion example
}
