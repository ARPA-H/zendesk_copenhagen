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

    it("rejects values that are neither (incl. path traversal / remote urls)", () => {
      setIconAssetBase("https://cdn.example.com/assets/");
      expect(classifyIconRef("../../etc/passwd")).toBeNull();
      expect(classifyIconRef("https://evil.example/x.svg")).toBeNull();
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
  });
});
