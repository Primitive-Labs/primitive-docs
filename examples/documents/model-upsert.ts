import { AppUser } from "../_harness/generated/ts/AppUser.generated";

// Upsert by a natural unique key (no need to know the existing record's id).
// The field must have a single-field unique constraint.
export async function upsertUser() {
  // #region example
  const user = new AppUser({ email: "alice@example.com", name: "Alice" });
  // Creates a new record, or merges into the existing one with that email.
  await user.save({ upsertOn: "email" });
  // #endregion example
}
