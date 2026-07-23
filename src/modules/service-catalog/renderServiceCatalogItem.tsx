import { createRoot } from "react-dom/client";

import { ServiceCatalogItem } from "./components/service-catalog-item/ServiceCatalogItem";

import type { ServiceCatalogItemProps } from "./components/service-catalog-item/ServiceCatalogItem";
import {
  createTheme,
  ThemeProviders,
  initI18next,
  loadTranslations,
  normalizeHelpCenterPath,
} from "../shared";
import type { Settings } from "../shared";
import { ErrorBoundary } from "../shared/error-boundary/ErrorBoundary";
import { initIconConfig } from "./utils/iconConfig";

export async function renderServiceCatalogItem(
  container: HTMLElement,
  settings: Settings,
  props: ServiceCatalogItemProps,
  iconAssetBase?: string
) {
  initIconConfig({
    assetBase: iconAssetBase,
    iconApiBase: settings.iconify_api_base,
  });
  const { baseLocale, helpCenterPath } = props;
  const safeHelpCenterPath = normalizeHelpCenterPath(helpCenterPath);
  initI18next(baseLocale);
  await loadTranslations(baseLocale, [
    () => import(`./translations/locales/${baseLocale}.json`),
    () => import(`../ticket-fields/translations/locales/${baseLocale}.json`),
    () => import(`../shared/translations/locales/${baseLocale}.json`),
  ]);
  createRoot(container).render(
    <ThemeProviders theme={createTheme(settings)}>
      <ErrorBoundary helpCenterPath={safeHelpCenterPath}>
        <ServiceCatalogItem {...props} helpCenterPath={safeHelpCenterPath} />
      </ErrorBoundary>
    </ThemeProviders>
  );
}
