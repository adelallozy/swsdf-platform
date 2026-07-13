import { defineStore } from "pinia";
import JWTService from "@/core/services/JWTService.js";

import localStorageService from "@/assets/js/LocalStorage.ts";

export const useUserStore = defineStore("user", {
  state: () => {
    return {
      locale: "ar",
      user: null,
      errors: null,
      avatar: null,
      profilePhotoLink: null,
      isAuthenticated: false,
      last_url_path: null,
      api_jwtoken: null,
      api_jwtoken_expiry: null,

      destinationPath: null,
      dataLoading: false,
    };
  },

  actions: {
    getUser() {
      if (null == this.user) {
        return {};
      }
      return this.user;
    },

    getProfilePhotoLink() {
      if (null == this.user || null == this.profilePhotoLink) {
        return null;
      }
      return this.profilePhotoLink;
    },

    getLocale() {
      return this.locale;
    },

    restoreUser() {
      let api_jwtoken = JWTService.getJWToken();
      let api_jwtoken_expiry = JWTService.getJWTokenExpiry();

      if (null == api_jwtoken) {
        return false;
      }

      this.isAuthenticated = true;
      this.api_jwtoken = api_jwtoken;
      this.api_jwtoken_expiry = api_jwtoken_expiry;

      // getUser getLocale setProfilePhotoLink

      this.user = localStorageService.getUser();
      this.locale = localStorageService.getLocale();
      this.profilePhotoLink = localStorageService.getProfilePhotoLink();
    },

    updateLoacalStorage() {},

    setToken(token) {
      this.isAuthenticated = true;
      this.api_jwtoken = token.api_jwtoken;
      this.api_jwtoken_expiry = token.api_jwtoken_expiry;
    },

    logOut() {
      this.isAuthenticated = false;
      this.user = null;
      this.avatar = null;
      this.errors = null;
      this.profilePhotoLink = null;
      JWTService.destroyJWToken();
    },

    async verifyToken({ commit }) {
      let JWToken = JWTService.getJWToken();
      let JWTokenExpiry = JWTService.getJWTokenExpiry();

      if (null == JWToken) {
        this.logOut;
        return false;
      }

      if (
        null != JWTokenExpiry &&
        JWTokenExpiry < new Date().getTime() + 1000 * 60 * 1
      ) {
        this.logOut;
        return false;
      }

      if (
        null == JWTokenExpiry ||
        JWTokenExpiry > new Date().getTime() + 1000 * 60 * 20
      ) {
        return true;
      }

      fetch(baseURL + "users/verify_token", {
        method: "POST",
        credentials: "include",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + JWToken,
          accept: "application/json",
        },
        body: JSON.stringify({
          api_jwtoken: JWToken,
          api_jwtoken_expiry: JWTokenExpiry,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            commit("SET_ERRORS", [response.message]);
            return null;
          }
          return response.json();
        })
        .then((data) => {
          if (undefined != data.api_jwtoken && null != data.api_jwtoken) {
            commit("SET_AUTH", {
              api_jwtoken: data.api_jwtoken,
              api_jwtoken_expiry: data.api_jwtoken_expiry,
            });
          }
          if (undefined != data.user && null != data.user) {
            commit("SET_USER", data.user);
          }
        })
        .catch((error) => {
          commit("SET_ERRORS", [error.message]);
          this.logOut;
        });
    },

    setDataLoading(status) {
      this.dataLoading = status;
    },
  },
});
