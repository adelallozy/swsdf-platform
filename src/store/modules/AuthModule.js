// import ApiService from "@/core/services/ApiService";
import JWTService from "@/core/services/JWTService.js";
import HttpService from "@/core/services/HttpService.js";
const baseURL = import.meta.env.VITE_API_BASE_URL;
const SIGN_UP_URL = import.meta.env.VITE_USERS_SIGN_UP;
const FORGOT_PASSWORD_URL = import.meta.env.VITE_USERS_FORGOT_PASSWORD;
const VERIFY_TOKEN_URL = import.meta.env.VITE_USERS_VERIFY_TOKEN;
const RESET_PASSWORD_URL = import.meta.env.VITE_RESET_PASSWORD_URL;
import ApiService from "@/core/services/ApiService";

export default {
  state() {
    return {
      user: {},
      errors: {},
      formValidationErrors: [],
      is_authenticated: false,
      lastPath: null,
    };
  },

  mutations: {
    SET_ERROR(state, error) {
      state.errors = { ...error };
    },

    SET_ERRORS(state, errors) {
      state.errors = { ...errors };
    },

    SET_FOMR_VALIDATION_ERRORS(state, errors) {
      state.formValidationErrors = errors;
    },

    SET_AUTH(state, token) {
      if (undefined == token.api_jwtoken || null == token.api_jwtoken) {
        state.is_authenticated = false;
        return;
      }

      state.is_authenticated = true;
      state.api_jwtoken = token.api_jwtoken;
      state.api_jwtoken_expiry = token.api_jwtoken_expiry;
      (state.errors = []),
        JWTService.setJWToken(token.api_jwtoken, token.api_jwtoken_expiry);
    },

    SET_USER(state, user) {
      state.user = user;
      JWTService.setUser(user);
    },

    setPassword(state, password) {
      state.user.password = password;
    },

    logOut(state) {
      state.is_authenticated = false;
      state.user = {};
      state.errors = [];
      JWTService.destroyJWToken();
    },

    SET_TOKEN(state, token) {
      state.is_authenticated = true;
      state.api_jwtoken = token.api_jwtoken;
      state.api_jwtoken_expiry = token.api_jwtoken_expiry;
    },

    SET_USET(state, user) {
      state.user = user;
    },

    SET_LAST_PATH(state, lastPath) {
      state.lastPath = lastPath;
    },
  },
  actions: {
    logOut({ commit }) {
      commit("logOut");
    },

    async SIGN_UP({ commit, status }, data) {
      await HttpService.post(SIGN_UP_URL, { body: JSON.stringify(data) })
        .then((response) => {
          if (
            (response.code == "400" || response.code == "422") &&
            response.status == "Data validation failed"
          ) {
            commit("SET_FOMR_VALIDATION_ERRORS", response.errors);
          } else {
            commit("SET_FOMR_VALIDATION_ERRORS", {});
          }

          if (response.constructor.name == "Response") {
            // if(response.status == '400' && response.statusText  == "Data validation failed" ) {
            //     console.log(response.errors);
            // }
          }

          if (
            undefined != response.api_jwtoken &&
            null != response.api_jwtoken
          ) {
            commit("SET_AUTH", {
              api_jwtoken: response.api_jwtoken,
              api_jwtoken_expiry: response.api_jwtoken_expiry,
            });
          }

          if (undefined != response.user && null != response.user) {
            commit("SET_USER", response.user);
          }
        })
        .catch((error) => {
          commit("SET_ERRORS", [error.message]);
        });
    },

    async VERIFY_TOKEN({ commit }, token) {
      await HttpService.get(VERIFY_TOKEN_URL, {
        headers: { Authentication: token },
        queries: { token },
      })
        .then((response) => {
          if (response.constructor.name == "Response" || !response.ok) {
            commit("SET_ERRORS", [response.statusText]);
            return null;
          }

          if (undefined != response.user && null != response.user) {
            commit("SET_USER", response.user);
          }
        })
        .catch((error) => {
          commit("SET_ERRORS", [error.message]);
        });
    },

    async SIGN_IN({ commit, state }, credentials) {
      const formData = new FormData();
      formData.append("email", credentials.email);
      formData.append("password", credentials.password);
      return fetch(baseURL + "users/login", {
        method: "POST",
        credentials: "include",
        mode: "cors",
        headers: {
          accept: "application/json",
        },
        body: formData,
      })
        .then((response) => {
          // response.ok response.status response.statusText
          // if(!response.ok){
          //     commit('SET_ERRORS', [response.message]);
          // }

          if (!response.ok) {
            commit("SET_ERRORS", [response.statusText]);
            return null;
          }
          return response.json();
        })

        .then((data) => {
          if (data == null) {
            return null;
          }

          if (data.code == 401) {
            commit("SET_ERRORS", [data.message]);
            return null;
          }

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
        });
    },
    register({ commit }, credentials) {},
    async FORGOT_PASSWORD({ commit }, data) {
      await HttpService.post(FORGOT_PASSWORD_URL, {
        body: JSON.stringify(data),
      })
        .then((response) => {
          console.log(response);
          if (response.code == "400") {
            commit("SET_ERRORS", [response.message]);
          }
        })
        .catch((error) => {
          console.log("Error", error);
          commit("SET_ERRORS", [error.message]);
        });
    },

    async RESET_PASSWORD({ commit }, { data, token }) {
      let options = { body: JSON.stringify(data) };
      if (token) {
        Object.assign(options, {
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
            Authentication: token,
          },
          queries: { token },
        });
      }
      await HttpService.post(RESET_PASSWORD_URL, options)
        .then((response) => {
          if (response.code == "400") {
            commit("SET_ERRORS", [response.message]);
          }
        })
        .catch((error) => {
          commit("SET_ERRORS", [error.message]);
        });
    },

    async VERIFY_AUTH({ commit }) {
      let JWToken = JWTService.getJWToken();
      let JWTokenExpiry = JWTService.getJWTokenExpiry();

      if (null == JWToken) {
        commit("logOut");
        return false;
      }

      if (
        null != JWTokenExpiry &&
        JWTokenExpiry < new Date().getTime() + 1000 * 60 * 1
      ) {
        commit("logOut");
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
          commit("logOut");
        });
    },

    REFRESH_TOKEN({ commit }) {
      let api_jwtoken = JWTService.getJWToken();
      let api_jwtoken_expiry = JWTService.getJWTokenExpiry();
      if (null == api_jwtoken) {
        return false;
      }
      commit("SET_TOKEN", { api_jwtoken, api_jwtoken_expiry });
    },
  },

  getters: {
    formValidationErrors(state) {
      return state.formValidationErrors;
    },

    isUserAuthenticated(state) {
      return state.is_authenticated;
    },

    getUser(state) {
      return state.user;
    },

    getErrors(state) {
      return state.errors;
    },

    getLastPath(state) {
      return state.lastPath;
    },
  },
};
