import JsBaoClient

// Relationship modeling with groups: a "parent-of" group per student, with the
// parent added as a member. A per-parameter access expression on the operation
// ("value in memberGroups('parent-of')") ensures a parent can only query their
// own child's data — the server enforces it.
func setUpParentOfRelationship(
  client: JsBaoClient,
  dbId: String,
  parentUserId: String
) async throws {
  // #region example
  // A "parent-of" group per student.
  _ = try await client.groups.create(params: CreateGroupParams(
    groupType: "parent-of",
    groupId: "student-123",
    name: "Parents of Student 123"
  ))
  _ = try await client.groups.addMember(
    groupType: "parent-of", groupId: "student-123",
    params: .userId(parentUserId)
  )

  // Parent queries their child's grades — server enforces access.
  let grades = try await client.databases.executeOperation(
    databaseId: dbId, name: "viewGrades",
    options: ExecuteOperationOptions(params: ["studentId": "student-123"])
  )
  _ = grades
  // #endregion example
}
