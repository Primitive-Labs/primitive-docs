import JsBaoClient

// Traverse declared relationships through the generated accessor methods:
// `hasMany` returns a plain array (sorted per the TOML), `refersTo` returns
// the parent or nil. Both accessors are `async throws`.
func traverseRelationships(authorId: String) async throws {
  // #region example
  guard let author = try await Author.find(authorId) else { return }

  // hasMany: author.posts() returns a plain array, ordered per the relationship
  let posts = try await author.posts()
  guard let firstPost = posts.first else { return }

  // refersTo: post.author() returns the parent record (or nil)
  let backRef = try await firstPost.author()
  // #endregion example
  _ = backRef
}
