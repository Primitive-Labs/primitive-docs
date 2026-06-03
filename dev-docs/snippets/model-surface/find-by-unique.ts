import { AppUser } from "../../../examples/_harness/generated/ts/AppUser.generated";

// Look up a record by a registered unique constraint, without knowing its id.
// Pass an array for a compound (multi-field) constraint.
export async function findByUnique() {
  // #region example
  const user = await AppUser.findByUnique("email", "alice@example.com");
  // #endregion example
  return user;
}
