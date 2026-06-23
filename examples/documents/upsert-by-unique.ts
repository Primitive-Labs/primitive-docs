import { Category } from "../_harness/generated/ts/Category.generated";

// Upsert by a NAMED unique constraint (single- or multi-field). Finds an
// existing record by the constraint and merges the data into it, or creates a
// new record if none matches. The lookup values are passed in field order, and
// the data object MUST carry the same constraint-field values (a mismatch
// throws). `targetDocument` is required whenever a new record may be created.
export async function upsertCategory(documentId: string) {
  // #region example
  // "name_parentId" is the named constraint declared in the schema
  // ([[models.categories.unique_constraints]] name = "name_parentId",
  //  fields = ["name", "parentId"]).
  const category = await Category.upsertByUnique(
    "name_parentId", // the constraint NAME — not the field list
    ["Work", "root"], // lookup values, in the constraint's field order
    { name: "Work", parentId: "root", color: "blue" },
    { targetDocument: documentId }, // required if a new record is created
  );
  // #endregion example
  return category;
}
