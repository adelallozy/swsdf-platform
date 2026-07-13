import { useI18n } from "vue-i18n";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/store/user.js";

export default function initiateCommonPlugins() {
  const store = useStore();
  const route = useRoute();
  const router = useRouter();
  const { t, te } = useI18n();
  const i18n = useI18n();
  const userStore = useUserStore();
  const translate = (text) => {
    if (!text || text == undefined || text == "" || text == undefined) {
      return "";
    }
    if (te(text)) {
      return t(text);
    } else {
      return text;
    }
  };

  return { userStore, route, router, store, i18n, t, te, translate };
}
