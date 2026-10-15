import type { ReactElement, ReactNode } from "react";
import { render as rtlRender } from "@testing-library/react";
import { ThemeProvider, DEFAULT_THEME } from "@zendeskgarden/react-theming";
import { ToastProvider } from "@zendeskgarden/react-notifications";
import i18next from "i18next";
import { initI18next } from "../shared/i18n";
import { ModalContainerProvider } from "../shared/garden-theme/modal-container/ModalContainerProvider";

export const testTheme = DEFAULT_THEME;

type ProvidersProps = {
  children: ReactNode;
};

const Providers = ({ children }: ProvidersProps) => {
  return (
    <ThemeProvider theme={testTheme}>
      <ModalContainerProvider>
        <ToastProvider>{children}</ToastProvider>
      </ModalContainerProvider>
    </ThemeProvider>
  );
};

/**
 * Renders with an i18next instance that has no messages, so every string is
 * its code default. Pass `translations` to give the locale some messages, for a
 * component that behaves differently where one exists.
 */
export const render = (
  ui: ReactElement,
  translations?: Record<string, string>
) => {
  initI18next("en-us");
  if (translations) {
    i18next.addResourceBundle("en-us", "translation", translations);
  }

  return rtlRender(ui, {
    wrapper: Providers,
  });
};
