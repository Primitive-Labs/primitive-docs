import type { JsBaoClient } from "js-bao-wss-client";

// Relationship modeling with groups: a "parent-of" group per student, with the
// parent added as a member. A per-parameter access expression on the operation
// ("value in memberGroups('parent-of')") ensures a parent can only query their
// own child's data — the server enforces it.
export async function setUpParentOfRelationship(
  client: JsBaoClient,
  dbId: string,
  parentUserId: string,
) {
  // #region example
  // A "parent-of" group per student.
  await client.groups.create({
    groupType: "parent-of",
    groupId: "student-123",
    name: "Parents of Student 123",
  });
  await client.groups.addMember("parent-of", "student-123", { userId: parentUserId });

  // Parent queries their child's grades — server enforces access.
  const grades = await client.databases.executeOperation(dbId, "viewGrades", {
    params: { studentId: "student-123" },
  });
  // #endregion example
  return grades;
}
