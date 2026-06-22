import { initializeClient, ANALYTICS_UNAUTHENTICATED_USER } from "js-bao-wss-client";

// End-to-end feature-usage tracking: configure auto events on the client, set
// an app-version override once, then log a per-feature action and a pre-auth
// landing event. No beforeunload flush — the client adds one automatically.
export async function setupFeatureTracking(currentUserUlid: string) {
  // #region example
  const client = await initializeClient({
    apiUrl: "https://primitiveapi.com",
    wsUrl: "wss://primitiveapi.com",
    appId: "YOUR_APP_ID",
    analyticsAutoEvents: {
      sessionEnd: true,
      blobUploads: { start: false, success: true, failure: true },
      llm: { start: false, success: true, failure: true },
    },
  });

  // Set version once after init (or after a deploy notification)
  client.analytics.setAppVersionOverride("2.1.4");

  function trackFeatureUsed(
    userUlid: string,
    feature: string,
    action: string,
    context?: Record<string, unknown>,
  ) {
    client.analytics.logEvent({
      action,
      feature,
      user_ulid: userUlid,
      context_json: context,
    });
  }

  // Authenticated event
  trackFeatureUsed(currentUserUlid, "reports", "report_generated", {
    reportType: "quarterly",
    format: "pdf",
  });

  // Pre-auth event (landing page)
  client.analytics.logEvent({
    action: "landing_page_view",
    feature: "onboarding",
    user_ulid: ANALYTICS_UNAUTHENTICATED_USER,
  });
  // #endregion example
  return client;
}
