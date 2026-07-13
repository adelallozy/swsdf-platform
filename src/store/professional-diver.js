import { defineStore } from "pinia";
import ApiService from "@/core/services/ApiService";

const GET_PROFESSIONAL_DIVER = import.meta.env.VITE_GET_PROFESSIONAL_DIVER;
export const useProfessionalDiverStore = defineStore("professional-diver", {
  state: () => {
    return {
      professionalDiver: null,
    };
  },

  actions: {
    fetchUserLinense(user_id) {
      return ApiService.get(GET_PROFESSIONAL_DIVER + "/" + user_id).then(
        (response) => {
          if (response.data.proDiver != undefined) {
            this.professionalDiver = response.data.proDiver;
          }
          return response;
        }
      );
    },
  },
});
