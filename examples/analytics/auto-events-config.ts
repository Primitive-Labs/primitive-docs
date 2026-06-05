import { initializeClient } from "js-bao-wss-client";

// Tune the lifecycle events the client emits automatically. All sub-options
// default to enabled.
export async function setupClientWithAutoEvents() {
  // #region example
  const client = await initializeClient({
    apiUrl: "https://primitiveapi.com",
    wsUrl: "wss://primitiveapi.com",
    appId: "YOUR_APP_ID",
    analyticsAutoEvents: {
      dailyAuth: true,
      returnActive: true,
      minResumeMs: 5 * 60 * 1000, // gap before another user_returned fires
      sessionEnd: true,
      syncErrors: { enabled: true, minIntervalMs: 30_000 },
      blobUploads: { start: false, success: true, failure: true },
      llm: { start: false, success: true, failure: true },
      gemini: false,
    },
  });
  // #endregion example
  return client;
}
