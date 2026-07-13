const baseURL = import.meta.env.VITE_API_BASE_URL;
import FetchOptions from "@/assets/js/FetchOptions.js";
import JWTService from "@/core/services/JWTService.js";

const defaultOptions = {
  method: "GET",
  credentials: "include",
  mode: "cors",
  headers: {
    "Content-Type": "application/json",
    accept: "application/json",
  },
};

class HttpService {
  static options = {};

  constructor(options = {}) {
    if (!HttpService.instance) {
      this.options = Object.assign(defaultOptions, options);
      this.options.headers = { ...defaultOptions.headers, ...options.headers };

      this.options.baseURL = baseURL;
      HttpService.instance = this;
    }
    this.setAuth();
    return HttpService.instance;
  }

  setAuth() {
    let token = JWTService.getJWToken();
    if (token) {
      this.options.headers.Authorization = "Bearer " + token;
    }
  }

  setPreferLang(lang = "en") {
    this.options.headers["Preferred-Language"] = lang;
  }

  async get(url, options = {}) {
    let urlQuery = "";

    if (options.queries != undefined && options.queries instanceof Object) {
      urlQuery = "?" + new URLSearchParams(options.queries).toString();
      delete options.queries;
    }

    const privateOptions = { ...this.options, ...options };
    privateOptions.headers = { ...this.options.headers, ...options.headers };
    let response = await fetch(baseURL + url + urlQuery, privateOptions);
    if (!response.ok || parseInt(response.status) >= 300) {
      return response;
    }
    const contentType = response.headers.get("content-type");

    if (!!contentType && contentType.includes("application/json")) {
      return response.json();
    }

    return response.text();
  }

  async post(url, options = {}) {
    let urlQuery = "";

    if (options.queries != undefined && options.queries instanceof Object) {
      urlQuery = "?" + new URLSearchParams(options.queries).toString();
      delete options.queries;
    }
    const fetchOptions = new FetchOptions({ ...this.options });
    fetchOptions.merge({ ...options, method: "POST" });

    let response = await fetch(baseURL + url + urlQuery, fetchOptions);
    const contentType = response.headers.get("content-type");
    if (!!contentType && contentType.includes("application/json")) {
      return response.json();
    }

    if (!response.ok) {
      return response;
    }

    return response.text();
  }

  async delete(url, options = {}) {
    const fetchOptions = new FetchOptions({ ...this.options });
    fetchOptions.merge({ ...options, method: "DELETE" });

    let response = await fetch(baseURL + url, fetchOptions);
    const contentType = response.headers.get("content-type");
    if (!!contentType && contentType.includes("application/json")) {
      return response.json();
    }

    if (!response.ok) {
      return response;
    }

    return response.text();
  }

  async postAsFormData(url, data, options = {}) {
    let formData = this.createFormData(data);
    const fetchOptions = new FetchOptions({ ...this.options });
    fetchOptions.merge({ ...options, method: "POST", body: formData });
    fetchOptions.removeContentTypeHeader();

    let response = await fetch(baseURL + url, fetchOptions);
    const contentType = response.headers.get("content-type");
    if (!!contentType && contentType.includes("application/json")) {
      return response.json();
    }

    if (!response.ok) {
      return response;
    }

    return response.text();
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
}

const httpService = new HttpService(defaultOptions);
Object.freeze(httpService);
export default httpService;
