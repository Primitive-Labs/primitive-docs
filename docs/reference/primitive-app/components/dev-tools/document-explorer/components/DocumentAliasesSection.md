# DocumentAliasesSection

Document Aliases Section - Manages aliases for a document in the
Document Properties Panel.

Shows existing aliases with remove buttons and an inline add input.
Click an existing alias to edit it inline (rename). Uses optimistic
updates with rollback on API failure.

---

## Props

| Prop name  | Description | Type    | Values | Default |
| ---------- | ----------- | ------- | ------ | ------- |
| documentId |             | string  | -      |         |
| canWrite   |             | boolean | -      |         |
