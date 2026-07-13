import { defineStore } from "pinia";

export const useSharedStore = defineStore("shared", {
  state: () => {
    return {
      locale: "ar",
      activeHttpRequests: [],
    };
  },

  actions: {
    activateLoadIndicator(requestIdentifier) {
      this.activeHttpRequests.push(requestIdentifier);
    },

    cancelLoadIndicator(requestIdentifier) {
      this.activeHttpRequests = this.activeHttpRequests.filter(
        (item) => item != requestIdentifier
      );
    },
  },
});
