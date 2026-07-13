import ApiService from "@/core/services/ApiService";
import localStorageService from "@/assets/js/LocalStorage.ts";

const LICENSED_DIVE_CENTERS = import.meta.env.VITE_LICENSED_DIVE_CENTERS;

const getLicensedCenters = function (selectLevel = "") {
  return ApiService.get(LICENSED_DIVE_CENTERS, selectLevel);
};

export default {
  getLicensedCenters,
};
