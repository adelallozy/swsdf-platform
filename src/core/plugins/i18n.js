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
  globalInjection: true,
  messages,
});

export default i18n;
