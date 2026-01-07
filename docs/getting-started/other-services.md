# Other Services

Beyond document storage and sync, Primitive provides additional services that handle common app needs—all accessible from your client-side code without building backend infrastructure.

## Blob Storage

Store files like images, PDFs, and attachments alongside your documents.

::: info Access Control
Blobs can only be accessed by signed-in users who have access to the associated document. If a user has `reader`, `read-write`, or `owner` permission on the document, they can access its blobs. Unauthenticated users cannot access blob URLs.
:::

### Uploading Files

```typescript
import { jsBaoClientService } from "primitive-app";

const client = await jsBaoClientService.getClientAsync();
const blobs = client.document(documentId).blobs();

// Upload from a File object (e.g., from an input)
const file = inputElement.files[0];
const fileData = await file.arrayBuffer();

const { blobId, numBytes } = await blobs.upload(
  new Uint8Array(fileData),
  {
    filename: file.name,
    contentType: file.type,
  }
);

console.log(`Uploaded ${numBytes} bytes with ID: ${blobId}`);
```

### Displaying Images

To display a blob in an `<img>` tag or other media element, use the `downloadUrl` with `disposition: "inline"`:

```typescript
const blobs = client.document(documentId).blobs();

// Get a URL suitable for image/media display
const imageUrl = blobs.downloadUrl(blobId, { disposition: "inline" });

// Use in an img tag
imageElement.src = imageUrl;
```

```vue
<template>
  <img :src="imageUrl" alt="User uploaded image" />
</template>
```

The URL includes authentication, so it only works for signed-in users with document access.

### Downloading Files

To trigger a file download (with a "Save As" dialog), use `disposition: "attachment"`:

```typescript
// Get a download URL
const url = blobs.downloadUrl(blobId, { disposition: "attachment" });

// Use in an anchor tag
downloadLink.href = url;
```

You can also read blob content directly into memory:

```typescript
const text = await blobs.read(blobId, { as: "text" });
const arrayBuffer = await blobs.read(blobId, { as: "arrayBuffer" });
const blob = await blobs.read(blobId, { as: "blob" });
```

### Listing and Managing Blobs

```typescript
// List all blobs in a document
const { items, cursor } = await blobs.list({ limit: 50 });

items.forEach(blob => {
  console.log(blob.blobId, blob.filename, blob.size);
});

// Get metadata for a specific blob
const meta = await blobs.get(blobId);

// Delete a blob
await blobs.delete(blobId);
```

### Offline Support

Blob storage works offline:

- **Uploads queue** when offline and complete when back online
- **Downloaded files cache** locally for offline access
- **Prefetch files** for offline use:

```typescript
// Cache specific files for offline access
await blobs.prefetch([blobId1, blobId2], { concurrency: 4 });
```

## LLM / AI Integration

Primitive proxies requests to language models, keeping your API keys secure on the server. Your app can make AI calls without exposing credentials.

### Chat Completions

```typescript
const client = await jsBaoClientService.getClientAsync();

const reply = await client.llm.chat({
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Summarize this document in 3 bullet points." },
  ],
  temperature: 0.7,
  max_tokens: 500,
});

console.log(reply.content);
```

### Available Models

```typescript
// List available models
const { models, defaultModel } = await client.llm.models();
console.log("Default:", defaultModel);
console.log("Available:", models);

// Use a specific model
const reply = await client.llm.chat({
  model: "gpt-4",
  messages: [{ role: "user", content: "Hello!" }],
});
```

### Gemini API

For Google's Gemini models:

```typescript
const result = await client.gemini.generate({
  messages: [
    {
      role: "user",
      parts: [{ type: "text", text: "Explain quantum computing simply." }],
    },
  ],
});

console.log(result.message.parts[0].text);
```

Gemini also supports structured output:

```typescript
const result = await client.gemini.generate({
  messages: [
    { role: "user", parts: [{ type: "text", text: "List 3 tasks for today." }] },
  ],
  structuredOutput: {
    responseMimeType: "application/json",
    responseJsonSchema: {
      type: "object",
      properties: {
        tasks: {
          type: "array",
          items: { type: "string" },
        },
      },
    },
  },
});
```

### Image Analysis

Both APIs support image input:

```typescript
// With Gemini
const result = await client.gemini.generate({
  messages: [
    {
      role: "user",
      parts: [
        { type: "text", text: "What's in this image?" },
        { type: "image", mimeType: "image/png", base64Data: imageBase64 },
      ],
    },
  ],
});
```

## Third-Party Integrations

Proxy HTTP requests to external APIs you've configured in the admin console. The server handles authentication so your app never sees API keys.

### Making Integration Calls

```typescript
const client = await jsBaoClientService.getClientAsync();

const response = await client.integrations.call({
  integrationKey: "weather-api",  // Configured in admin console
  method: "GET",
  path: "/forecast",
  query: { city: "San Francisco", units: "metric" },
});

console.log(response.status);  // HTTP status from upstream
console.log(response.body);    // Response data
```

### Error Handling

```typescript
import { isJsBaoError } from "js-bao-wss-client";

try {
  const response = await client.integrations.call({
    integrationKey: "crm-api",
    method: "POST",
    path: "/contacts",
    body: { email: "user@example.com" },
  });
} catch (error) {
  if (isJsBaoError(error)) {
    switch (error.code) {
      case "INTEGRATION_NOT_FOUND":
        console.error("Integration not configured");
        break;
      case "INTEGRATION_SECRET_MISSING":
        console.error("API credentials not set up");
        break;
      case "INTEGRATION_PROXY_FAILED":
        console.error("External API error:", error.details);
        break;
    }
  }
}
```

### Setting Up Integrations

Integrations are configured in the [Primitive Admin Console](https://admin.primitiveapi.com):

1. Go to your app settings
2. Add a new integration
3. Configure the base URL, authentication, and allowed endpoints
4. Your client code can then call the integration by key

## Analytics

Track user behavior and app usage with built-in analytics.

### Automatic Events

Primitive automatically logs common events:

- `user_active_daily` — First auth per calendar day
- `client_boot` — App initialization
- `first_doc_open` — First document opened
- `first_doc_edit` — First edit made
- `offline_recovery` — Coming back online
- `session_end` — User leaving the app

### Custom Events

Log your own events:

```typescript
const client = await jsBaoClientService.getClientAsync();

client.analytics.logEvent({
  action: "task_completed",
  feature: "tasks",
  context_json: {
    taskId: task.id,
    timeToComplete: duration,
  },
});
```

### Controlling Auto-Events

Configure which automatic events are tracked:

```typescript
// In your js-bao config
analyticsAutoEvents: {
  dailyAuth: true,
  boot: true,
  firstDocOpen: true,
  firstDocEdit: false,  // Disable this one
  blobUploads: {
    start: false,
    success: true,
    failure: true,
  },
}
```

### Viewing Analytics

Analytics data is available in the Primitive Admin Console under your app's dashboard.

## User Waitlist

Launch your app in invite-only mode to control early access.

### How It Works

1. **Enable invite-only** in your app settings on the admin console
2. Users who aren't invited see a waitlist signup form
3. Manage the waitlist and send invites from the admin console
4. Invited users can sign in normally

### Checking Waitlist Status

The client handles this automatically—unauthenticated users on invite-only apps see the waitlist UI. You can also check programmatically:

```typescript
// In your app, the user store handles waitlist state
const user = useUserStore();

// If the user isn't invited, they'll be redirected to waitlist
// This is handled automatically by primitive-app's auth guards
```

### Use Cases

- **Beta launches** — Control who gets early access
- **Gradual rollout** — Add users in batches
- **Private apps** — Keep access limited to specific users

## Next Steps

- **[Is Primitive Right for You?](./good-and-bad-apps.md)** — Understand ideal use cases
- **[API Reference](/reference/)** — Detailed documentation for all APIs

