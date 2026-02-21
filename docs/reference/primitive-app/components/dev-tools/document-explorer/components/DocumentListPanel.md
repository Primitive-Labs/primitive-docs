# DocumentListPanel

Document List Panel - Left sidebar for the Document Explorer V2 layout.

Displays a searchable document list with checkboxes for bulk actions,
permission badges, root document indicator, and a pending invitations accordion
with bulk accept/reject support.

---

## Props

| Prop name              | Description                                                                          | Type    | Values | Default |
| ---------------------- | ------------------------------------------------------------------------------------ | ------- | ------ | ------- |
| documents              |                                                                                      | Array   | -      |         |
| selectedDocId          |                                                                                      | union   | -      |         |
| selectedInvitationId   | ID of the currently selected invitation (used for highlight)                         | union   | -      |         |
| documentListLoaded     |                                                                                      | boolean | -      |         |
| pendingInvitations     |                                                                                      | Array   | -      |         |
| isAcceptingInvitations | Whether a bulk accept operation is in progress (disables interaction, shows loading) | boolean | -      |         |

## Events

| Event name          | Properties | Description                                              |
| ------------------- | ---------- | -------------------------------------------------------- |
| select-document     |            |
| select-invitation   |            |
| create-document     |            |
| bulk-delete         |            |
| bulk-leave          |            |
| bulk-delete-mixed   |            | Mixed selection containing both owned and non-owned docs |
| accept-invitations  |            |
| decline-invitations |            |

## Expose

### showDocsSection

>

### isCollapsed

>
