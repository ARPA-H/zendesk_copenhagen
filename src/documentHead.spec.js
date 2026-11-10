import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, it, expect } from "@jest/globals";

// The check is inline in templates/document_head.hbs because it has to run
// before any bundle loads, so this spec lifts it out of the template and runs
// that same code against a fake sessionStorage. Jest runs from the repository
// root, so the path is relative to it.
const template = readFileSync("templates/document_head.hbs", "utf8");
const source = template.match(
  /const flashWaiting = (\(\(\) => \{[\s\S]*?\n {2}\}\)\(\));/
)[1];

const KEY = "HC_FLASH_NOTIFICATIONS";

function fakeStorage(
  value,
  { throwOnGet = false, throwOnRemove = false } = {}
) {
  const data = new Map(value === undefined ? [] : [[KEY, value]]);
  return {
    getItem(key) {
      if (throwOnGet) throw new DOMException("denied", "SecurityError");
      return data.has(key) ? data.get(key) : null;
    },
    removeItem(key) {
      if (throwOnRemove) throw new DOMException("denied", "SecurityError");
      data.delete(key);
    },
    has: (key) => data.has(key),
  };
}

const flashWaiting = (sessionStorage) =>
  runInNewContext(source, { window: { sessionStorage } });

describe("the toast host check in document_head.hbs", () => {
  it("counts a non-empty array as a waiting flash and leaves it for the host", () => {
    const storage = fakeStorage(
      JSON.stringify([{ type: "success", message: "Saved" }])
    );

    expect(flashWaiting(storage)).toBe(true);
    expect(storage.has(KEY)).toBe(true);
  });

  it("finds nothing waiting when there is no value", () => {
    expect(flashWaiting(fakeStorage(undefined))).toBe(false);
    expect(flashWaiting(fakeStorage(""))).toBe(false);
  });

  it.each([
    ["an empty array", "[]"],
    ["text that is not JSON", "not json at all"],
    ["null", "null"],
    ["an object", '{"type":"success"}'],
    ["a number", "7"],
    ["a string", '"text"'],
  ])(
    "drops %s instead of loading the host for it on every page",
    (_label, value) => {
      const storage = fakeStorage(value);

      expect(flashWaiting(storage)).toBe(false);
      expect(storage.has(KEY)).toBe(false);
    }
  );

  it("loads the host when storage cannot be read, as every page did before", () => {
    expect(flashWaiting(fakeStorage("[]", { throwOnGet: true }))).toBe(true);
  });

  it("still finds nothing waiting when an unusable value cannot be removed", () => {
    const storage = fakeStorage("null", { throwOnRemove: true });

    expect(flashWaiting(storage)).toBe(false);
  });
});
