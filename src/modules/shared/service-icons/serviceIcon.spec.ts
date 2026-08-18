import {
  parseIconRef,
  stripIconMarker,
  classifyIconRef,
  resolveItemIcon,
} from "./serviceIcon";
import { setIconAssetBase } from "./iconAssetBase";

describe("serviceIcon", () => {
  afterEach(() => setIconAssetBase(""));

  describe("parseIconRef", () => {
    it("extracts an Iconify reference from a marker", () => {
      expect(parseIconRef("Great tool. [icon: logos:figma]")).toBe(
        "logos:figma"
      );
    });

    it("is tolerant of whitespace and casing", () => {
      expect(parseIconRef("[ICON:   mdi:laptop  ]")).toBe("mdi:laptop");
    });

    it("returns null when there is no marker", () => {
      expect(parseIconRef("just a description")).toBeNull();
      expect(parseIconRef("")).toBeNull();
      expect(parseIconRef(null)).toBeNull();
    });
  });

  describe("stripIconMarker", () => {
    it("removes the marker from user-facing text", () => {
      expect(stripIconMarker("Design tool [icon: logos:figma]")).toBe(
        "Design tool"
      );
    });

    it("leaves text without a marker untouched", () => {
      expect(stripIconMarker("no marker here")).toBe("no marker here");
    });
  });

  describe("classifyIconRef", () => {
    it("recognizes Iconify names", () => {
      expect(classifyIconRef("logos:figma")).toEqual({
        kind: "iconify",
        name: "logos:figma",
      });
    });

    it("resolves asset filenames against the configured base", () => {
      setIconAssetBase("https://cdn.example.com/assets/");
      expect(classifyIconRef("arpa-h-logomark.svg")).toEqual({
        kind: "image",
        url: "https://cdn.example.com/assets/arpa-h-logomark.svg",
      });
    });

    it("ignores an asset filename when no base is configured", () => {
      expect(classifyIconRef("arpa-h-logomark.svg")).toBeNull();
    });

    it("recognizes a direct https SVG URL", () => {
      expect(classifyIconRef("https://cdn.example.com/icons/x.svg")).toEqual({
        kind: "image",
        url: "https://cdn.example.com/icons/x.svg",
      });
    });

    it("accepts an https SVG URL with a query string", () => {
      expect(classifyIconRef("https://cdn.example.com/x.svg?v=2")).toEqual({
        kind: "image",
        url: "https://cdn.example.com/x.svg?v=2",
      });
    });

    it("rejects non-https or non-svg URLs", () => {
      expect(classifyIconRef("http://cdn.example.com/x.svg")).toBeNull();
      expect(classifyIconRef("https://cdn.example.com/x.png")).toBeNull();
      expect(classifyIconRef("javascript:alert(1)")).toBeNull();
    });

    it("rejects values that are neither (incl. path traversal)", () => {
      setIconAssetBase("https://cdn.example.com/assets/");
      expect(classifyIconRef("../../etc/passwd")).toBeNull();
      expect(classifyIconRef("")).toBeNull();
    });
  });

  describe("resolveItemIcon", () => {
    it("prefers the description marker over everything else", () => {
      expect(
        resolveItemIcon({
          name: "Figma",
          description: "Vector tool [icon: mdi:pencil]",
          thumbnailUrl: "https://cdn/upload.png",
        })
      ).toEqual({ kind: "iconify", name: "mdi:pencil" });
    });

    it("falls back to the curated map by item name", () => {
      expect(resolveItemIcon({ name: "Figma", description: "Design" })).toEqual(
        { kind: "iconify", name: "logos:figma" }
      );
    });

    it("falls back to the uploaded thumbnail", () => {
      expect(
        resolveItemIcon({
          name: "Unmapped service",
          thumbnailUrl: "https://cdn/x.png",
        })
      ).toEqual({ kind: "image", url: "https://cdn/x.png" });
    });

    it("falls back to the default icon", () => {
      expect(resolveItemIcon({ name: "Unmapped service" })).toEqual({
        kind: "default",
      });
    });

    it("does not crash or reflect the name back on an unterminated angle-bracket sequence", () => {
      // Regression test: a single-pass `<[^>]*>` strip on a name like
      // "Figma<script" would leave a literal "<script" substring behind
      // uneaten (no closing '>' for the regex to match against), which is
      // exactly the js/incomplete-multi-character-sanitization pattern.
      // normalizeName's output is only ever used as a SERVICE_ICON_MAP
      // lookup key here, so this was never renderable as HTML, but the
      // lookup itself must still miss cleanly (falling through to the
      // default icon) rather than accidentally matching a curated entry.
      expect(resolveItemIcon({ name: "Figma<script" })).toEqual({
        kind: "default",
      });
    });
  });
});
