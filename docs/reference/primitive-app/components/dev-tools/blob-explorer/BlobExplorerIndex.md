# BlobExplorerIndex

---

Blob Explorer — standalone three-panel dev-tools tab.

Left panel: Document list (search + role badges).
Middle panel: Blob table with toolbar (search, type filter, upload, bulk-delete bar).
Right panel: Blob detail (preview, actions, info, download URL).

Matches the mock at mocks/blob-explorer/blob-explorer.html exactly.
Shares the document selection state with the Document Explorer tab via
useDocumentExplorerStore so the user's selection persists when switching tabs.
