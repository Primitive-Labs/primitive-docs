import { Post } from "../_harness/generated/ts/Post.generated";
import { Author } from "../_harness/generated/ts/Author.generated";

// Pass `include` in a query to batch-load related records alongside the rows,
// instead of issuing a follow-up query per result. Related records ride along
// under `_related` on each row, keyed by the include's `as`.
export async function loadRelatedData() {
  // #region example
  // refersTo — each Post's Author (the `authorId` FK lives on Post):
  const posts = await Post.query({}, {
    include: [{ model: "authors", type: "refersTo", sourceField: "authorId", as: "author" }],
  });
  for (const post of posts.data as (Post & { _related?: { author?: Author } })[]) {
    console.log(post.title, post._related?.author?.name);
  }

  // hasMany — every Post that points back at each Author, newest first:
  const authors = await Author.query({}, {
    include: [{ model: "posts", type: "hasMany", foreignKey: "authorId", as: "posts", sort: { createdAt: -1 }, limit: 10 }],
  });
  for (const author of authors.data as (Author & { _related?: { posts?: Post[] } })[]) {
    console.log(author.name, (author._related?.posts ?? []).length);
  }
  // #endregion example
  return { posts: posts.data, authors: authors.data };
}
