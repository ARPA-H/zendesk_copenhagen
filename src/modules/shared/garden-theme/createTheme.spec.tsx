import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { Button } from "@zendeskgarden/react-buttons";
import { getColor } from "@zendeskgarden/react-theming";
import { createTheme } from "./createTheme";
import { NEXUS_COLORS, NEXUS_PALETTE } from "./nexusPalette";
import { ThemeProviders } from "./ThemeProviders";

const LABEL = "Label";

const tokens = readFileSync(join(process.cwd(), "styles/_tokens.scss"), "utf8");

const relativeLuminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrastOnWhite = (hex: string) => 1.05 / (relativeLuminance(hex) + 0.05);

describe("NEXUS_COLORS", () => {
  it.each(Object.entries(NEXUS_COLORS))(
    "%s matches styles/_tokens.scss",
    (name, value) => {
      const declaration = new RegExp(
        `--color-${name}:\\s*(#[0-9a-f]{6});`,
        "i"
      );
      expect(tokens.match(declaration)?.[1].toLowerCase()).toBe(value);
    }
  );
});

describe("NEXUS_PALETTE", () => {
  it.each(Object.entries(NEXUS_PALETTE))(
    "%s never gets lighter as the shade rises",
    (_hue, scale) => {
      const ratios = Object.values(scale).map(contrastOnWhite);
      ratios.slice(1).forEach((ratio, index) => {
        expect(ratio).toBeGreaterThanOrEqual(ratios[index]);
      });
    }
  );

  it.each(Object.entries(NEXUS_PALETTE))(
    "%s shades 600 and up pass 4.5:1 on white",
    (_hue, scale) => {
      [600, 700, 800, 900, 1000, 1100, 1200].forEach((shade) => {
        expect(
          contrastOnWhite(scale[shade as keyof typeof scale])
        ).toBeGreaterThanOrEqual(4.5);
      });
    }
  );
});

describe("createTheme", () => {
  const theme = createTheme();

  it("uses the NEXUS link blue for primary text, focus and links", () => {
    expect(getColor({ theme, variable: "foreground.primary" })).toBe("#0957be");
    expect(getColor({ theme, variable: "border.primaryEmphasis" })).toBe(
      "#0957be"
    );
    expect(
      getColor({
        theme,
        variable: "foreground.primary",
        light: { offset: 100 },
      })
    ).toBe("#07418f");
  });

  it("uses indigo for body text and a text-safe grey for subtle text", () => {
    expect(getColor({ theme, variable: "foreground.default" })).toBe("#000334");
    expect(getColor({ theme, variable: "foreground.subtle" })).toBe("#4a4d52");
    expect(getColor({ theme, hue: "grey", shade: 600 })).toBe("#6f747a");
  });

  it("maps feedback hues to NEXUS feedback colors", () => {
    expect(getColor({ theme, variable: "foreground.danger" })).toBe("#bf2d1d");
    expect(getColor({ theme, variable: "foreground.success" })).toBe("#3c690e");
    expect(getColor({ theme, variable: "foreground.warning" })).toBe("#7a5d20");
  });

  it("does not apply the legacy color settings", () => {
    const withSettings = createTheme({
      brand_color: "#ff00ff",
      link_color: "#00ff00",
      text_color: "#ff0000",
    });
    expect(
      getColor({ theme: withSettings, variable: "foreground.default" })
    ).toBe("#000334");
    expect(
      getColor({ theme: withSettings, variable: "foreground.primary" })
    ).toBe("#0957be");
  });

  it("renders the primary button cyan with indigo text and a pill shape", () => {
    render(
      <ThemeProviders theme={theme}>
        <Button isPrimary>{LABEL}</Button>
      </ThemeProviders>
    );
    const style = getComputedStyle(screen.getByRole("button"));
    expect(style.backgroundColor).toBe("rgb(82, 218, 242)");
    expect(style.color).toBe("rgb(0, 3, 52)");
    expect(style.borderRadius).toBe("1000px");
  });

  it("drops disabled buttons to 40% opacity and keeps their NEXUS colors", () => {
    render(
      <ThemeProviders theme={theme}>
        <Button isPrimary disabled>
          {LABEL}
        </Button>
        <Button disabled>{LABEL}</Button>
      </ThemeProviders>
    );
    const [primary, outline] = screen.getAllByRole("button");
    expect(getComputedStyle(primary).opacity).toBe("0.4");
    expect(getComputedStyle(primary).backgroundColor).toBe("rgb(82, 218, 242)");
    expect(getComputedStyle(outline).opacity).toBe("0.4");
    expect(getComputedStyle(outline).color).toBe("rgb(0, 3, 52)");
  });

  it("renders the default button as an indigo outline", () => {
    render(
      <ThemeProviders theme={theme}>
        <Button>{LABEL}</Button>
      </ThemeProviders>
    );
    const style = getComputedStyle(screen.getByRole("button"));
    expect(style.color).toBe("rgb(0, 3, 52)");
    expect(style.borderColor).toBe("rgb(0, 3, 52)");
  });
});
