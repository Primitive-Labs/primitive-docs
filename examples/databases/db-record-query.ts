import type { JsBaoClient } from "js-bao-wss-client";

// Direct record queries on a DoDb handle: the filter grammar, multi-field AND,
// $or/$and, sort + cursor pagination, projection, and related-data includes.
export async function recordQueries(client: JsBaoClient, databaseId: string) {
  const db = client.databases.connect(databaseId);
  // #region example
  // Filter operators: exact match, comparisons, set membership, text, $or/$and.
  const result = await db.query("tasks", {
    completed: false,
    priority: { $gte: 5 },
    category: { $in: ["work", "urgent"] },
    title: { $startsWith: "Ship" },
    tags: { $contains: "featured" },
    $or: [{ category: "work" }, { priority: { $gte: 8 } }],
  });

  // Multiple fields on the same object are ANDed; use explicit $and to put
  // two conditions on one field.
  const priced = await db.query("tasks", {
    $and: [{ priority: { $gte: 1 } }, { priority: { $lte: 5 } }],
  });

  // Sort, limit, and cursor pagination.
  const page1 = await db.query("tasks", {}, { sort: { priority: -1 }, limit: 20 });
  const page2 = page1.hasMore
    ? await db.query("tasks", {}, {
        sort: { priority: -1 },
        limit: 20,
        uniqueStartKey: page1.nextCursor,
      })
    : undefined;

  // Projection — return only the named fields.
  const titles = await db.query("tasks", {}, { projection: { title: 1, completed: 1 } });

  // Include related records — they land under _related on each parent.
  const withCategory = await db.query("tasks", {}, {
    include: [{ model: "categories", type: "refersTo", sourceField: "category", as: "categoryInfo" }],
  });
  // #endregion example
  return { result, priced, page1, page2, titles, withCategory };
}
