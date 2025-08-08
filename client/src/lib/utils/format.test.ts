import test from "node:test";
import assert from "node:assert/strict";
import { getDueDateStatus } from "./format";

test("overdue when date is before today", () => {
  const result = getDueDateStatus(
    new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  );
  assert.equal(result.status, "overdue");
});

test("today when date is today", () => {
  const result = getDueDateStatus(new Date().toISOString());
  assert.equal(result.status, "today");
});

test("soon when date is within next 3 days", () => {
  const result = getDueDateStatus(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
  );
  assert.equal(result.status, "soon");
});

test("normal when date is further out", () => {
  const result = getDueDateStatus(
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
  );
  assert.equal(result.status, "normal");
});
