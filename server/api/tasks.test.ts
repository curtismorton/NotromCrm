import { test } from "node:test";
import assert from "node:assert/strict";

test("getDueSoonTasks excludes tasks outside three-day window", async () => {
  process.env.DATABASE_URL = "postgres://user:pass@localhost:5432/db";
  process.env.SESSION_SECRET = "secret";
  process.env.OPENAI_API_KEY = "key";

  const { getDueSoonTasks } = await import("./tasks");

  const now = new Date();
  const addDays = (d: Date, days: number) => new Date(d.getTime() + days * 86_400_000);

  const data = [
    {
      title: "inside",
      status: "todo",
      completedAt: null,
      dueDate: addDays(now, 1),
    },
    {
      title: "after",
      status: "todo",
      completedAt: null,
      dueDate: addDays(now, 4),
    },
    {
      title: "before",
      status: "todo",
      completedAt: null,
      dueDate: addDays(now, -1),
    },
  ];

  const stubDb = {
    select() {
      return {
        from() {
          return {
            where() {
              return {
                orderBy() {
                  const threeDaysFromNow = new Date(now);
                  threeDaysFromNow.setDate(now.getDate() + 3);
                  return data
                    .filter(
                      (t) =>
                        t.dueDate >= now &&
                        t.dueDate <= threeDaysFromNow &&
                        t.completedAt === null &&
                        t.status === "todo"
                    )
                    .sort((a, b) => +a.dueDate - +b.dueDate);
                },
              };
            },
          };
        },
      };
    },
  } as any;

  const results = await getDueSoonTasks(stubDb);
  assert.deepEqual(results.map((t: any) => t.title), ["inside"]);
});

