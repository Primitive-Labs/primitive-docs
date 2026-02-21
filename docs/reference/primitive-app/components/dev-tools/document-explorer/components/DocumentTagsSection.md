# DocumentTagsSection

Document Tags Section - Manages tags for a document in the Document Properties Panel.

Shows existing tags with remove buttons and an inline add input. Uses
optimistic updates with rollback on API failure.

---

## Props

| Prop name  | Description                                                 | Type    | Values | Default |
| ---------- | ----------------------------------------------------------- | ------- | ------ | ------- |
| documentId |                                                             | string  | -      |         |
| baseTags   | Tags from the parent document prop (server source of truth) | Array   | -      |         |
| canWrite   |                                                             | boolean | -      |         |
| isRoot     | Whether this document is the root document                  | boolean | -      |         |

## Events

| Event name        | Properties | Description |
| ----------------- | ---------- | ----------- |
| documents-changed |            |
