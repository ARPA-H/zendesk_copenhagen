import i18next from "i18next";
import { initReactI18next } from "react-i18next";

let initStarted = false;

// True once any module has called initI18next on this page. Every call
// re-initializes the one shared instance with empty resources, so a caller that
// only needs an instance to exist (the toast host) checks this first instead of
// wiping what a page module has already set up.
export function hasInitializedI18next(): boolean {
  return initStarted;
}

export function initI18next(locale: string) {
  initStarted = true;
  i18next.use(initReactI18next).init({
    resources: {
      [`${locale}`]: {},
    },
    lng: locale,
    lowerCaseLng: true,
    interpolation: {
      escapeValue: false,
    },
    keySeparator: false,
    pluralSeparator: ".",
  });
}
