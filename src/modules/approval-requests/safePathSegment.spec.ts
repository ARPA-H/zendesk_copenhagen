import { safePathSegment } from "./safePathSegment";

describe("safePathSegment", () => {
  it("accepts numeric ids", () => {
    expect(safePathSegment("1234")).toBe("1234");
  });

  it("accepts ULID-shaped ids", () => {
    expect(safePathSegment("01HZY3V5T9XKQW8RB2M4N6P7SD")).toBe(
      "01HZY3V5T9XKQW8RB2M4N6P7SD"
    );
  });

  it("accepts ids with underscores and dashes", () => {
    expect(safePathSegment("workflow_12-3")).toBe("workflow_12-3");
  });

  it("rejects dot segments that browsers normalize into other routes", () => {
    expect(() => safePathSegment(".")).toThrow();
    expect(() => safePathSegment("..")).toThrow();
    expect(() => safePathSegment("..%2Fother")).toThrow();
  });

  it("rejects path separators and percent-encoding", () => {
    expect(() => safePathSegment("foo/bar")).toThrow();
    expect(() => safePathSegment("foo%2Fbar")).toThrow();
    expect(() => safePathSegment("a?b=c")).toThrow();
    expect(() => safePathSegment("a#b")).toThrow();
  });

  it("rejects the empty string", () => {
    expect(() => safePathSegment("")).toThrow();
  });
});
