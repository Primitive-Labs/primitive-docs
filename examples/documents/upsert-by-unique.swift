import Foundation
import JsBaoClient

// Upsert by a NAMED unique constraint (single- or multi-field). The lookup
// values come straight from the record's own fields — every constraint field
// must be set. `upsertByUnique` merges into the existing record matched by the
// constraint, or creates a new one if none matches, returning the resolved
// record (on the merge path its `id` is the existing record's id).
func upsertCategory(documentId: String) throws {
  // #region example
  let category = Category(
    id: UUID().uuidString,
    name: "Work",
    parentId: "root",
    color: "blue"
  )
  // "name_parentId" is the named constraint declared in models.toml. `mode`
  // defaults to .either (create-or-update); pass .mustExist / .mustNotExist to
  // require a single path.
  let resolved = try category.upsertByUnique("name_parentId", in: documentId)
  // #endregion example
  _ = resolved
}
