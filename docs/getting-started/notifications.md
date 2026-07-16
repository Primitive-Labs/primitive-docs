# Notifications

A **notification** lets you reach a user outside the flow they're currently in — a report finishing, an invite arriving, a reminder firing on a schedule. Every notification lands in a durable inbox the recipient can read at any time, and can also ring their phone as a push alert in the same call. Send one from your app or from a [workflow](./workflows.md); the recipient reads their inbox and manages push devices from the client.

## Sending a Notification and Reading the Inbox

Send a notification to a specific user with `client.notifications.send()`. `channels` defaults to `["in-app"]`; add `"ios"` or `"android"` to also push to the user's registered devices:

<<< ../../examples/notifications/send.ts#example{ts} [JavaScript]

The response's `results` array has one entry per requested channel, so you can tell exactly what happened even when a send is partially successful — one channel can deliver while another fails or is skipped.

On the receiving side, `client.notifications.list()` returns the caller's own inbox, newest first, along with an `unreadCount`:

<<< ../../examples/notifications/list-inbox.ts#example{ts} [JavaScript]

`markAllRead()` clears every unread item in one call when you don't need to mark them individually.

## Registering for Push

Push delivery needs a device token on file. Register one after the user grants notification permission on their device — typically right after login, or the first time they opt in:

<<< ../../examples/notifications/register-device.ts#example{ts} [JavaScript]

`registerDevice()` upserts by token: calling it again with the same token (e.g. on every app launch) just refreshes the device's metadata rather than creating a duplicate. `listDevices()` returns the caller's registered devices, and `unregisterDevice(token)` removes one — call it on logout so a signed-out device stops receiving pushes for that account. A registered device only ever exposes a `tokenSuffix` (the last 8 characters) back to your app; the full token is never echoed over the wire once it's been registered.

## Sending from a Workflow

A workflow can send a notification with the `notification.send` step, the server-side equivalent of `client.notifications.send()`:

```toml
[[steps]]
id = "notify"
kind = "notification.send"
toUserId = "{{ input.userId }}"
title = "Your report is ready"
body = "Tap to view this week's summary."
channels = ["in-app", "ios"]
deepLink = "myapp://reports/latest"
```

The step succeeds only when at least one requested channel actually delivered — a send that reaches nobody (every channel failed, was rate-limited, or the recipient had no registered device) reports `ok: false` even though the step ran. See the [Workflows step reference](./workflows.md#notificationsend) for the full field list.

## Live Updates

While a user is connected, a sent notification also arrives immediately as a `notification` event — useful for updating a badge or toast without waiting on a poll:

```typescript
client.on("notification", (event) => {
  console.log(event.title, event.body);
});
```

This event is a live, best-effort nudge — the inbox row from `list()` is the durable, authoritative record. If the recipient isn't connected at send time, they simply see the notification the next time they call `list()` or `unreadCount()`; nothing is lost.

## Idempotency and Deduplication

Pass `idempotencyKey` on `send()` to make a retry safe. A repeat call with the same key inside the dedupe window doesn't re-send — the response reports `deduplicated: true` when every requested channel was already handled, or `deduplicatedChannels` naming just the channels served from the earlier send while the rest were retried fresh. Dedupe is tracked per channel and, for push, per device token — so retrying a send where one device succeeded and another temporarily failed re-sends only to the device that still needs it, without duplicating the one that already got the alert.

## Rate Limiting

Sends are capped per app, per hour, per channel: 5,000 in-app notifications and 1,000 push dispatches. Exceeding the limit for every requested channel raises a rate-limit error that reports the limit and when it resets; a request spanning multiple channels only fails the channels that are actually over their limit; the rest deliver normally.
