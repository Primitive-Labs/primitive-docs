import { Author } from "../_harness/generated/ts/Author.generated";

// Traverse declared relationships through the generated accessor methods:
// `hasMany` returns a PaginatedResult, `refersTo` returns the parent or null.
export async function traverseRelationships(authorId: string) {
  // #region example
  const author = await Author.find(authorId);
  if (!author) return;

  // hasMany: author.posts() returns a PaginatedResult — rows are on `.data`
  const posts = await author.posts();
  const firstPost = posts.data[0];

  // refersTo: post.author() returns the parent record (or null)
  const backRef = await firstPost.author();
  // #endregion example
  return { posts, firstPost, backRef };
}
