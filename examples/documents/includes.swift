import JsBaoClient

// Pass `include` in a query to batch-load related records alongside the rows,
// instead of following each relationship one row at a time. Every declared
// relationship gets a typed `include<Rel>()` builder and a typed `related<Rel>`
// accessor to read the attached records.
func loadRelatedData() throws {
  // #region example
  // refersTo — each Post's Author (the `authorId` FK lives on Post):
  let posts = try Post.query(include: [Post.includeAuthor()])
  for post in posts {
    let author = post.relatedAuthor          // Author?
    print(post.title, author?.name ?? "—")
  }

  // hasMany — every Post that points back at each Author, newest first:
  let authors = try Author.query(include: [Author.includePosts(limit: 10)])
  for author in authors {
    let authored = author.relatedPosts       // [Post]
    print(author.name, authored.count)
  }
  // #endregion example
  _ = posts
  _ = authors
}
