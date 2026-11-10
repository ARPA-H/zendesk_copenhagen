import { createRoot } from "react-dom/client";
import { createTranslationLoader } from "../shared/i18n/createTranslationLoader";
import { ticketFieldsTranslations } from "../ticket-fields";
import type { Settings } from "../shared";
import {
  sharedTranslations,
  createTheme,
  ThemeProviders,
  loadTranslations,
  initI18next,
} from "../shared";
import type { NewRequestFormProps } from "./NewRequestForm";
import { NewRequestForm } from "./NewRequestForm";

export async function renderNewRequestForm(
  settings: Settings,
  props: NewRequestFormProps,
  container: HTMLElement
) {
  const { baseLocale, locale } = props;

  initI18next(baseLocale);
  await loadTranslations(locale, baseLocale, [
    createTranslationLoader(
      "new-request-form",
      (locale) => import(`./translations/locales/${locale}.json`)
    ),
    ticketFieldsTranslations,
    sharedTranslations,
  ]);

  createRoot(container).render(
    <ThemeProviders theme={createTheme(settings)}>
      <NewRequestForm {...props} />
    </ThemeProviders>
  );
}
