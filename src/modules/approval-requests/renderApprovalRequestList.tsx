import { createRoot } from "react-dom/client";
import { createTranslationLoader } from "../shared/i18n/createTranslationLoader";
import ApprovalRequestListPage from "./ApprovalRequestListPage";
import type { ApprovalRequestListPageProps } from "./ApprovalRequestListPage";
import {
  sharedTranslations,
  createTheme,
  ThemeProviders,
  initI18next,
  loadTranslations,
  normalizeHelpCenterPath,
} from "../shared";
import type { Settings } from "../shared";
import { ErrorBoundary } from "../shared/error-boundary/ErrorBoundary";

export async function renderApprovalRequestList(
  container: HTMLElement,
  settings: Settings,
  props: ApprovalRequestListPageProps & { locale: string },
  helpCenterPath: string
) {
  const { baseLocale, locale } = props;
  const safeHelpCenterPath = normalizeHelpCenterPath(helpCenterPath);
  initI18next(baseLocale);
  await loadTranslations(locale, baseLocale, [
    createTranslationLoader(
      "approval-requests",
      (locale) => import(`./translations/locales/${locale}.json`)
    ),
    sharedTranslations,
  ]);

  createRoot(container).render(
    <ThemeProviders theme={createTheme(settings)}>
      <ErrorBoundary helpCenterPath={safeHelpCenterPath}>
        <ApprovalRequestListPage
          {...props}
          helpCenterPath={safeHelpCenterPath}
        />
      </ErrorBoundary>
    </ThemeProviders>
  );
}
