import { defineStore } from "pinia";

export const usePageStore = defineStore("page", {
  state: () => {
    return {
      locale: "ar",
      pageTitle: "",
      breadcrumb: {
        title: "",
        pagePath: [],
      },
    };
  },
});
