import { hasInitializedI18next, initI18next } from "./initI18next";

describe("initI18next", () => {
  it("reports whether a module has started it", () => {
    expect(hasInitializedI18next()).toBe(false);

    initI18next("en-us");

    expect(hasInitializedI18next()).toBe(true);
  });
});
