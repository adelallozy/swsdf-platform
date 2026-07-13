import { useI18n } from "vue-i18n";

export const translate = (text) => {
  const { t, te } = useI18n();
  if (te(text)) {
    return t(text);
  } else {
    return text;
  }
};

export const getLocale = (defaultLocale = "ar") => {
  let locale = localStorage.getItem("locale");
  return locale ? locale : defaultLocale;
};
