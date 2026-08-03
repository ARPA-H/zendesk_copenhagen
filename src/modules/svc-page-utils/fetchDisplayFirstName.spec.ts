import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { fetchDisplayFirstName } from "./fetchDisplayFirstName";

describe("fetchDisplayFirstName", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("resolves the first name from a real name", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ user: { name: "Jane Doe" } }),
      })
    ) as unknown as typeof fetch;

    await expect(fetchDisplayFirstName()).resolves.toBe("Jane");
  });

  it("prefers user_fields.full_name over an alias-like name", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            user: {
              name: "jdoe",
              user_fields: { full_name: "Jane Doe" },
            },
          }),
      })
    ) as unknown as typeof fetch;

    await expect(fetchDisplayFirstName()).resolves.toBe("Jane");
  });

  it('handles "Last, First" formatted names', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ user: { name: "Doe, Jane" } }),
      })
    ) as unknown as typeof fetch;

    await expect(fetchDisplayFirstName()).resolves.toBe("Jane");
  });

  it("resolves to an empty string when the response has no user", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    ) as unknown as typeof fetch;

    await expect(fetchDisplayFirstName()).resolves.toBe("");
  });

  it("resolves to an empty string on a failed response", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: false, json: () => Promise.resolve({}) })
    ) as unknown as typeof fetch;

    await expect(fetchDisplayFirstName()).resolves.toBe("");
  });

  it("never rejects, even on a network error", async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error("network down"))
    ) as unknown as typeof fetch;

    await expect(fetchDisplayFirstName()).resolves.toBe("");
  });
});
