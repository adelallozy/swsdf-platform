import ApiService from "@/core/services/ApiService";
import localStorageService from "@/assets/js/LocalStorage.ts";
import forms from "@/assets/js/Forms.js";

import store from "@/store/index.ts";

import { useUserStore } from "@/store/user";
// import { useSharedStore } from "@/store/shared.js";

const SIGN_UP_URL = import.meta.env.VITE_USERS_SIGN_UP;
const SIGN_IN_URL = import.meta.env.VITE_USERS_SIGN_IN;
const USER_DOCUMENTS = import.meta.env.VITE_USER_DOCUMENTS;

const userStore = useUserStore();

const signUp = function (userData) {
  // const formData =  forms.createFormData(credentials) ;

  return ApiService.post(SIGN_UP_URL, userData).then((response) => {
    if (response.data.api_jwtoken != undefined) {
      store.commit("SET_AUTH", {
        api_jwtoken: response.data.api_jwtoken,
        api_jwtoken_expiry: response.data.api_jwtoken_expiry,
      });
      userStore.isAuthenticated = true;
      localStorageService.setJWToken(
        response.data.api_jwtoken,
        response.data.api_jwtoken_expiry
      );
    }

    if (response.data.user != undefined) {
      userStore.user = response.data.user;
      store.commit("SET_USER", response.data.user);
    }

    if (response.data.profile_photo != undefined) {
      userStore.profilePhoto = response.data.profile_photo;
      localStorageService.setProfilePhoto(response.data.profile_photo);
    }
  });
};

export const signIn = function (credentials) {
  const formData = forms.createFormData(credentials);
  return ApiService.post(SIGN_IN_URL, formData).then((response) => {
    if (response.status === 401 || response.data == undefined) {
      throw response;
    }

    if (response.data.api_jwtoken != undefined) {
      store.commit("SET_AUTH", {
        api_jwtoken: response.data.api_jwtoken,
        api_jwtoken_expiry: response.data.api_jwtoken_expiry,
      });
      userStore.isAuthenticated = true;
      localStorageService.setJWToken(
        response.data.api_jwtoken,
        response.data.api_jwtoken_expiry
      );
    }

    if (response.data.user != undefined) {
      userStore.user = response.data.user;
      store.commit("SET_USER", response.data.user);
      localStorageService.setUser(response.data.user);
    }

    if (response.data.profile_photo_link == undefined) {
      userStore.profilePhotoLink = response.data.profile_photo_link;
      localStorageService.setProfilePhotoLink(response.data.profile_photo_link);
    }
  });
};

export const getDocuments = function () {
  return ApiService.get(USER_DOCUMENTS);
};

export default {
  signUp,
  signIn,
  getDocuments,
};
