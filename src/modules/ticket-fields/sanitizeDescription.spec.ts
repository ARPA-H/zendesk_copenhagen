import { sanitizeDescription } from "./sanitizeDescription";

describe("sanitizeDescription", () => {
  it("preserves safe formatting and links with target", () => {
    const result = sanitizeDescription(
      '<strong>Required</strong> — see <a href="https://example.com" target="_blank" rel="noopener noreferrer">the docs</a>'
    );

    expect(result).toContain("<strong>Required</strong>");
    expect(result).toContain('href="https://example.com"');
    expect(result).toContain('target="_blank"');
  });

  it("removes script tags", () => {
    expect(sanitizeDescription("hint<script>alert(1)</script>")).toBe("hint");
  });

  it("removes event-handler attributes", () => {
    const result = sanitizeDescription('<img src="x" onerror="alert(1)">');

    expect(result).not.toContain("onerror");
  });

  it("removes javascript: URLs", () => {
    const result = sanitizeDescription('<a href="javascript:alert(1)">x</a>');

    expect(result).not.toContain("javascript:");
  });

  it("removes iframes", () => {
    const result = sanitizeDescription(
      '<iframe src="https://example.com"></iframe>ok'
    );

    expect(result).not.toContain("<iframe");
    expect(result).toContain("ok");
  });

  it("returns identical output for repeated (memoized) input", () => {
    const input = "<em>same description</em>";

    expect(sanitizeDescription(input)).toBe(sanitizeDescription(input));
  });

  it("handles the empty string", () => {
    expect(sanitizeDescription("")).toBe("");
  });
});
