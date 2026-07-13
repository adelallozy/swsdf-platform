export const setJWToken = (token, expiry = null) => {
  window.localStorage.setItem("jwt_token", token);
  if (null == expiry) {
    return;
  }
  window.localStorage.setItem("jwt_token_expiry", expiry);
};

export const getJWToken = () => {
  return window.localStorage.getItem("jwt_token");
};

export const getPreferredLanguage = () => {
  return window.localStorage.getItem("locale");
};

export const setPreferredLanguage = (language) => {
  window.localStorage.setItem("locale", language);
};

// Deprecated
export const setUserLanguage = (locale) => {
  window.localStorage.setItem("locale", locale);
};

// Deprecated
export const getUserLanguage = () => {
  let lang = window.localStorage.getItem("locale");
  if (!lang) {
    return "ar";
  }
  return lang;
};

export const destroyJWToken = () => {
  window.localStorage.removeItem("jwt_token");
  window.localStorage.removeItem("jwt_token_expiry");
};

export const setJWTokenExpiry = (expiry) => {
  window.localStorage.setItem("jwt_token_expiry", expiry);
};

export const getJWTokenExpiry = () => {
  return window.localStorage.getItem("jwt_token_expiry");
};

export const setUser = (user) => {
  window.localStorage.setItem("user", JSON.stringify(user));
};

export const getUser = () => {
  return JSON.parse(window.localStorage.getItem("user"));
};

export const destroyUser = () => {
  JSON.parse(window.localStorage.removeItem("user"));
};

export const distroySession = () => {
  window.localStorage.clear();
};

export default {
  getUser,
  setUser,
  destroyUser,
  getJWToken,
  setJWToken,
  destroyJWToken,
  getJWTokenExpiry,
  setJWTokenExpiry,
  distroySession,
  // getPreferredLanguage , setPreferredLanguage,
  // getUserLanguage, setUserLanguage
};
