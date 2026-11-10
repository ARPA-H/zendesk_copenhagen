import { readdirSync, readFileSync } from "node:fs";
import { describe, it, expect } from "@jest/globals";

// Zendesk's theme importer rejects an SVG asset that does not open with "<svg" or
// "<?xml": a comment before the root failed the whole upload with FileNotSupported
// (PLAN.md, session 2026-08-04), so a credit or a note goes inside the root. Jest runs
// from the repository root, so the path is relative to it.
const svgs = readdirSync("assets").filter((name) => name.endsWith(".svg"));

describe("the theme's SVG assets", () => {
  it("are found", () => {
    expect(svgs.length).toBeGreaterThan(0);
  });

  it.each(svgs)("%s opens with <svg or <?xml", (name) => {
    expect(readFileSync(`assets/${name}`, "utf8")).toMatch(
      /^(?:<svg[\s>]|<\?xml[\s?])/
    );
  });
});
