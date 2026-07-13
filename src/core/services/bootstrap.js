import LocalStorage from "@/assets/js/LocalStorage.ts";
import { useSharedStore } from "@/store/shared.js";
import { useUserStore } from "@/store/user.js";

const initLocale = function () {
  let locale = LocalStorage.getLocale();
  if (!locale) {
    locale = "ar";
    LocalStorage.setLocale(locale);
  }

  const userStore = useUserStore();
  const sharedStore = useSharedStore();
  sharedStore.locale = locale;
  userStore.locale = locale;
};

export default { initLocale };
