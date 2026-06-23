[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / WorkflowStatusValue

# Type Alias: WorkflowStatusValue

> **WorkflowStatusValue** = `"completed"` \| `"failed"` \| `"terminated"` \| `"running"` \| `"apply_pending"` \| `"apply_claimed"`

Terminal/transient status reported by `workflows.getStatus()` and
`workflows.terminate()`. The success terminal state is the canonical
`"completed"` — matching the `workflowStatus` event, `runSync`, and the
persisted `run.status` (issue #967). The raw Cloudflare `"complete"`
spelling is normalized client-side and is no longer surfaced.
