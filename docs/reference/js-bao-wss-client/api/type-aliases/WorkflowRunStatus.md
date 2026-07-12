[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / WorkflowRunStatus

# Type Alias: WorkflowRunStatus

> **WorkflowRunStatus** = `"queued"` \| `"running"` \| `"completed"` \| `"failed"` \| `"terminated"` \| `"apply_pending"` \| `"apply_claimed"`

Persisted status of a workflow run row. This is the model's documented set
(`models.yaml` `WorkflowRun.status`) and is a superset of
`WorkflowStatusValue` (it also includes `"queued"`). #1388 relies on it to
distinguish terminal states — keep this union tied to the model's set so the
two stay consistent.
