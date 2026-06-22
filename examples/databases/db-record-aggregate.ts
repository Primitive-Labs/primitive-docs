import type { JsBaoClient } from "js-bao-wss-client";

// Direct-record aggregation: group by one or more fields and compute
// count/sum/avg/min/max, with an optional filter, sort, and limit.
export async function recordAggregate(client: JsBaoClient, databaseId: string) {
  const db = client.databases.connect(databaseId);
  // #region example
  const result = await db.aggregate("tasks", {
    groupBy: ["category"],
    operations: [
      { type: "count" },
      { type: "sum", field: "estimatedHours" },
      { type: "avg", field: "estimatedHours" },
      { type: "min", field: "priority" },
      { type: "max", field: "priority" },
    ],
    filter: { completed: false },
    sort: { field: "count", direction: -1 },
    limit: 10,
  });
  // #endregion example
  return result;
}
