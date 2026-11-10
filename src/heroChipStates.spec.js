import { describe, expect, it } from "@jest/globals";
import { readFileSync } from "node:fs";

// The hero's popular-search chips sit on a dark indigo scrim. The global link rules in
// styles/_base.scss (a:visited, a:hover, a:active, a:focus) set colors meant for light
// surfaces, and each outranks a single class, so a chip that only says `color` on its own
// class turned violet once visited and blue when hovered, focused or pressed: about 2:1 and
// 1.3:1 on the scrim. The chip has to pin its label in every one of those states.

const STATES = ["visited", "hover", "active", "focus"];

const read = (file) => readFileSync(file, "utf8");

// [ids, classes and pseudo-classes, elements] of a selector made of one element, classes and
// pseudo-classes, which is all these rules use.
const specificity = (selector) => [
  (selector.match(/#[\w-]+/g) || []).length,
  (selector.match(/\.[\w-]+/g) || []).length +
    (selector.match(/(?<!:):[\w-]+/g) || []).length,
  (selector.match(/^[a-z][\w-]*/i) || []).length,
];

const outranks = (a, b) => {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return a[i] > b[i];
  }
  return false;
};

// The rule that starts with the first line of the chip's pinned-state selector list.
const pinnedRule = () => {
  const source = read("styles/_svc-home.scss");
  const start = source.search(/^a\.svc-hero-chip,/m);
  if (start === -1) return null;
  const open = source.indexOf("{", start);
  const close = source.indexOf("}", open);
  return {
    selectors: source
      .slice(start, open)
      .split(",")
      .map((selector) => selector.trim()),
    body: source.slice(open + 1, close),
  };
};

describe("the hero chips' link states", () => {
  it("are pinned in one rule", () => {
    expect(pinnedRule()).not.toBeNull();
  });

  it.each(STATES)("keep a white label when %s", (state) => {
    const rule = pinnedRule();

    expect(rule.selectors).toContain(`a.svc-hero-chip:${state}`);
    expect(rule.body).toMatch(/color:\s*var\(--color-white\)/);
  });

  it("have no underline in any state", () => {
    expect(pinnedRule().body).toMatch(/text-decoration:\s*none/);
  });

  it.each(STATES)(
    "outrank the global a:%s rule, which is still there to be outranked",
    (state) => {
      const base = read("styles/_base.scss");

      expect(base).toContain(`&:${state}`);
      expect(
        outranks(
          specificity(`a.svc-hero-chip:${state}`),
          specificity(`a:${state}`)
        )
      ).toBe(true);
    }
  );
});
