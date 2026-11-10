import type { IGardenTheme } from "@zendeskgarden/react-theming";
import { DEFAULT_THEME, getColor } from "@zendeskgarden/react-theming";
import { css } from "styled-components";
import { NEXUS_COLORS as c, NEXUS_PALETTE } from "./nexusPalette";

export interface Settings {
  /**
   * Optional base URL of a self-hosted Iconify API used to resolve
   * service-catalog icon references. Empty -> Iconify's public API.
   */
  iconify_api_base?: string;
}

interface ButtonStyleProps {
  $isBasic?: boolean;
  $isDanger?: boolean;
  $isLink?: boolean;
  $isNeutral?: boolean;
  $isPrimary?: boolean;
}

/**
 * Garden's default system stack puts the platform font on some components;
 * the product's body face is Public Sans, so it leads the stack. Sizes stay in
 * pixels because Garden's own sizing math needs them; the three values that
 * fall between NEXUS steps (10, 22 and 26) move to the nearest step.
 */
const FONT_STACK =
  '"Public Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const INDIGO_OVERLAY_5 = "rgba(0, 3, 52, 0.05)";
const INDIGO_OVERLAY_10 = "rgba(0, 3, 52, 0.1)";
const overlay = (color: string) => `linear-gradient(${color}, ${color})`;

const createAccessibleFormControlStyle = (isWrapper: boolean) => {
  const invalidSelector = isWrapper
    ? ':has(input[aria-invalid="true"])'
    : '[aria-invalid="true"]';

  return css`
    /* Boost default border contrast to 3:1 or better (grey 600 on white is
       4.7:1); :not() preserves the validation colors */
    &:not(${invalidSelector}) {
      border-color: ${(p) =>
        getColor({
          theme: p.theme,
          variable: "border.default",
          dark: { offset: -100 },
          light: { offset: 300 },
        })};
    }

    /* Enhanced hover state */
    &:hover:not(${invalidSelector}) {
      border-color: ${(p) =>
        getColor({
          theme: p.theme,
          variable: "border.primaryEmphasis",
          dark: { offset: -100 },
          light: { offset: 100 },
        })};
    }
  `;
};

const accessibleFormInputStyle = createAccessibleFormControlStyle(false);
const accessibleFormWrapperStyle = createAccessibleFormControlStyle(true);

/**
 * NEXUS buttons are pills. The primary kind is cyan with indigo text (white on
 * cyan is 1.6:1), the default kind is an indigo outline, hover darkens with an
 * indigo overlay instead of a second color, and a disabled button drops to 40%
 * opacity. The native disabled attribute already blocks clicks, so pointer
 * events stay on for tooltips. Garden passes its options to styled-components
 * as transient props ($isPrimary and so on).
 */
const buttonStyle = css<ButtonStyleProps>`
  ${(p) =>
    !p.$isLink &&
    css`
      border-radius: 1000px;

      &:disabled {
        opacity: 0.4;
      }
    `}

  ${(p) =>
    p.$isPrimary &&
    !p.$isDanger &&
    !p.$isNeutral &&
    css`
      background-color: ${c["cyan-neutral"]};
      color: ${c["indigo-neutral"]};

      &:hover:not(:disabled),
      &:active:not(:disabled) {
        background-color: ${c["cyan-neutral"]};
        background-image: ${overlay(INDIGO_OVERLAY_10)};
      }

      &:disabled {
        background-color: ${c["cyan-neutral"]};
        color: ${c["indigo-neutral"]};
      }
    `}

  ${(p) =>
    !p.$isPrimary &&
    !p.$isBasic &&
    !p.$isDanger &&
    !p.$isLink &&
    !p.$isNeutral &&
    css`
      border-color: ${c["indigo-neutral"]};
      color: ${c["indigo-neutral"]};

      &:hover:not(:disabled),
      &:active:not(:disabled) {
        border-color: ${c["indigo-neutral"]};
        background-color: transparent;
        background-image: ${overlay(INDIGO_OVERLAY_5)};
        color: ${c["indigo-neutral"]};
      }

      &:disabled {
        border-color: ${c["indigo-neutral"]};
        background-color: transparent;
        color: ${c["indigo-neutral"]};
      }
    `}
`;

/**
 * Link order matters: visited first, then hover, active and focus, so a hover
 * on a visited link still shows the hover color.
 */
const anchorStyle = css`
  &:visited {
    color: ${c["violet-600"]};
  }

  &:hover,
  &:active,
  &:focus {
    color: ${c["blue-800"]};
  }
`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- the render functions keep passing their settings; every color comes from the NEXUS tokens, so none is read here
export function createTheme(settings?: Settings): IGardenTheme {
  const { light } = DEFAULT_THEME.colors.variables;

  return {
    ...DEFAULT_THEME,
    rtl: document.dir === "rtl",
    fonts: {
      ...DEFAULT_THEME.fonts,
      system: FONT_STACK,
    },
    fontSizes: {
      ...DEFAULT_THEME.fontSizes,
      xs: "12px",
      xl: "24px",
      xxl: "28px",
      // Garden's XXXL is the service page h1, which is 32px like every other h1.
      xxxl: "32px",
    },
    palette: {
      ...DEFAULT_THEME.palette,
      ...NEXUS_PALETTE,
    },
    colors: {
      ...DEFAULT_THEME.colors,
      variables: {
        ...DEFAULT_THEME.colors.variables,
        light: {
          ...light,
          foreground: {
            ...light.foreground,
            default: c["indigo-neutral"],
            // Grey 800 (4a4d52) stays readable on the grey 50 surface tint
            subtle: "neutralHue.800",
          },
        },
      },
    },
    components: {
      "buttons.anchor": anchorStyle,
      "buttons.button": buttonStyle,
      "forms.input": accessibleFormInputStyle,
      "forms.textarea": accessibleFormInputStyle,
      "forms.faux_input": accessibleFormInputStyle,
      "dropdowns.combobox.trigger": accessibleFormWrapperStyle,
    },
  };
}
