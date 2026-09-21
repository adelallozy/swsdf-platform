import { createI18n } from "vue-i18n";

import ar from "../../locales/ar.json";
import arabicUserProfiles from "@/locales/arabic-user-profiles.json";

import en from "../../locales/en.json";

const messages = {
  ar: { ...ar, ...arabicUserProfiles },
  en,
};

let locale = localStorage.getItem("locale") || import.meta.env.VITE_DEFAULT_LOCALE || "ar";
const i18n = createI18n({
  legacy: false,
  locale,
  fallbackLocale: false,
  fallbackFormat: true,
  missingWarn: false,
  fallbackWarn: false,
  missing: (missingLocale, key) => {
    if (import.meta.env.DEV && missingLocale === "ar") {
      console.warn(`[i18n] Missing Arabic translation for "${key}"`);
    }
  },
  globalInjection: true,
  messages,
});

export default i18n;
