/**
 * ARPA-H NEXUS color primitives used by the React modules.
 *
 * Garden resolves colors in JavaScript (`getColor`), so the CSS custom
 * properties in `styles/_tokens.scss` cannot feed its color scales. This file
 * mirrors the primitives it needs; `nexusPalette.spec.ts` fails when a value
 * drifts from `_tokens.scss`.
 */
export const NEXUS_COLORS = {
  "indigo-neutral": "#000334",
  "cyan-neutral": "#52daf2",

  "grey-0": "#ffffff",
  "grey-50": "#f3f5f8",
  "grey-100": "#e5eaf0",
  "grey-200": "#d7dee8",
  "grey-400": "#bac2cc",
  "grey-neutral": "#959ba3",
  "grey-600": "#6f747a",
  "grey-700": "#4a4d52",
  "grey-800": "#252729",
  "grey-900": "#131314",

  "blue-50": "#e6f5fc",
  "blue-100": "#cdeafa",
  "blue-200": "#b4e0f7",
  "blue-400": "#65c4ee",
  "blue-neutral": "#2fb1e6",
  "blue-700": "#0957be",
  "blue-800": "#07418f",
  "blue-900": "#042c5f",
  "blue-1000": "#021630",

  "violet-600": "#4535a7",

  "pink-50": "#feeff6",
  "pink-100": "#fde0ed",
  "pink-200": "#fdd0e5",
  "pink-400": "#fd82ba",
  "pink-neutral": "#fd4497",
  "pink-600": "#c93678",
  "pink-800": "#6f1e43",
  "pink-900": "#4a142d",
  "pink-1000": "#250a16",

  "green-50": "#dee6d7",
  "green-200": "#9eb487",
  "green-300": "#7d9b5e",
  "green-neutral": "#3c690e",
  "green-700": "#284609",
  "green-800": "#1e3507",
  "green-900": "#142305",
  "green-1000": "#0a1202",

  "yellow-50": "#fdf3df",
  "yellow-100": "#fbe8bf",
  "yellow-200": "#f9dca0",
  "yellow-neutral": "#f3b940",
  "yellow-600": "#ca9a35",
  "yellow-800": "#7a5d20",
  "yellow-900": "#513e15",
  "yellow-1000": "#291f0b",

  "red-50": "#f4dcd9",
  "red-100": "#eab9b4",
  "red-300": "#d47368",
  "red-neutral": "#bf2d1d",
  "red-700": "#7f1e13",
  "red-800": "#60170f",
  "red-900": "#400f0a",
  "red-1000": "#200805",
} as const;

const c = NEXUS_COLORS;

type Scale = Record<
  100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 1000 | 1100 | 1200,
  string
>;

/**
 * Garden hues are 12-step scales (100 to 1200); NEXUS ramps have 11 steps.
 * Each Garden shade takes the NEXUS step whose contrast against white is
 * closest to the shade's target, and shades 600 and up never fall below 4.5:1
 * so anything Garden or the modules draw as text with them passes WCAG AA.
 * Where NEXUS has no step in between, neighboring shades share a color.
 */
export const NEXUS_PALETTE: Record<
  "grey" | "blue" | "pink" | "green" | "yellow" | "red",
  Scale
> = {
  grey: {
    100: c["grey-50"],
    200: c["grey-100"],
    300: c["grey-200"],
    400: c["grey-400"],
    500: c["grey-neutral"],
    600: c["grey-600"],
    700: c["grey-600"],
    800: c["grey-700"],
    900: c["grey-800"],
    1000: c["grey-800"],
    1100: c["grey-900"],
    1200: c["grey-900"],
  },
  blue: {
    100: c["blue-50"],
    200: c["blue-100"],
    300: c["blue-200"],
    400: c["blue-400"],
    500: c["blue-neutral"],
    600: c["blue-700"],
    700: c["blue-700"],
    800: c["blue-800"],
    900: c["blue-900"],
    1000: c["blue-1000"],
    1100: c["blue-1000"],
    1200: c["blue-1000"],
  },
  pink: {
    100: c["pink-50"],
    200: c["pink-100"],
    300: c["pink-200"],
    400: c["pink-400"],
    500: c["pink-neutral"],
    600: c["pink-600"],
    700: c["pink-600"],
    800: c["pink-800"],
    900: c["pink-900"],
    1000: c["pink-900"],
    1100: c["pink-1000"],
    1200: c["pink-1000"],
  },
  green: {
    100: c["green-50"],
    200: c["green-50"],
    300: c["green-50"],
    400: c["green-200"],
    500: c["green-300"],
    600: c["green-neutral"],
    700: c["green-neutral"],
    800: c["green-700"],
    900: c["green-800"],
    1000: c["green-900"],
    1100: c["green-900"],
    1200: c["green-1000"],
  },
  yellow: {
    100: c["yellow-50"],
    200: c["yellow-100"],
    300: c["yellow-200"],
    400: c["yellow-neutral"],
    500: c["yellow-600"],
    600: c["yellow-800"],
    700: c["yellow-800"],
    800: c["yellow-900"],
    900: c["yellow-1000"],
    1000: c["yellow-1000"],
    1100: c["yellow-1000"],
    1200: c["yellow-1000"],
  },
  red: {
    100: c["red-50"],
    200: c["red-50"],
    300: c["red-50"],
    400: c["red-100"],
    500: c["red-300"],
    600: c["red-neutral"],
    700: c["red-neutral"],
    800: c["red-700"],
    900: c["red-800"],
    1000: c["red-900"],
    1100: c["red-900"],
    1200: c["red-1000"],
  },
};
