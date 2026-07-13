const baseURL = import.meta.env.VITE_API_BASE_URL;
import FetchOptions from "@/assets/js/FetchOptions.js";
import JWTService from "@/core/services/JWTService.js";
import { getLocale } from "@/assets/js/LocalStorage.ts";

const defaultOptions = {
  method: "GET",
  credentials: "include",
  mode: "cors",
  headers: {
    "Content-Type": "application/json",
    accept: "application/json",
  },
};

class EasyFetch {
  static options = {};

  constructor(options = {}) {
    if (!EasyFetch.instance) {
      this.options = Object.assign(defaultOptions, options);
      this.options.headers = { ...defaultOptions.headers, ...options.headers };

      this.options.baseURL = baseURL;
      EasyFetch.instance = this;
    }
    this.setAuth();
    this.setPreferLang(getLocale());
    return EasyFetch.instance;
  }

  setAuth() {
    this.options.headers.Authorization = "Bearer " + JWTService.getJWToken();
  }

  setPreferLang(lang = "en") {
    this.options.headers["Preferred-Language"] = lang;
    this.options.headers["Accept-Language"] = lang;
  }

  postWithFile(url, data, options = {}) {
    let formData = this.createFormData(data);
    const fetchOptions = new FetchOptions({ ...this.options });
    fetchOptions.merge({ ...options, method: "POST", body: formData });
    fetchOptions.removeContentTypeHeader();

    return new Promise(function (resolve, reject) {
      fetch(baseURL + url, fetchOptions)
        .then((response) => {
          const contentType = response.headers.get("content-type");
          if (!!contentType && contentType.includes("application/json")) {
            return response.json();
          }

          if (response.status >= 200 && response.status < 300) {
            resolve(response);
            return true;
          } else {
            reject(response);
            return false;
          }
        })
        .then((response) => {
          if ("status" in response && response.status == "Success") {
            resolve(response);
            return true;
          } else {
            reject(response);
            return false;
          }
        })
        .catch((error) => {
          reject({
            status: "Failure",
            message: error.message,
          });
        });
    });
  }

  createFormData(data) {
    const formData = new FormData();
    for (let key in data) {
      if (data[key] == null) {
        formData.append(key, "");
      } else {
        formData.append(key, data[key]);
      }
    }
    return formData;
  }

  get(url, options = {}) {
    let urlQuery = "";

    if (options.queries != undefined && options.queries instanceof Object) {
      urlQuery = "?" + new URLSearchParams(options.queries).toString();
      delete options.queries;
    }

    const privateOptions = { ...this.options, ...options };
    privateOptions.headers = { ...this.options.headers, ...options.headers };

    return new Promise(function (resolve, reject) {
      fetch(baseURL + url + urlQuery, privateOptions)
        .then((response) => {
          const contentType = response.headers.get("content-type");
          if (!!contentType && contentType.includes("application/json")) {
            return response.json();
          }

          if (response.status >= 200 && response.status < 300) {
            resolve(response);
            return true;
          } else {
            reject(response);
            return false;
          }
        })
        .then((response) => {
          if ("status" in response && response.status == "Success") {
            resolve(response);
            return true;
          } else {
            reject(response);
            return false;
          }
        })
        .catch((error) => {
          reject({
            status: "Failure",
            message: error.message,
          });
          return false;
        });
    });
  }
}

const easyFetch = new EasyFetch(defaultOptions);
Object.freeze(easyFetch);
export default easyFetch;
