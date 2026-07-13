export const getToken = () => {
  return window.sessionStorage.getItem("id_token");
};

export const setToken = (token) => {
  window.sessionStorage.setItem("id_token", token);
};

export const destroyToken = () => {
  window.sessionStorage.removeItem("id_token");
};

export const getTokenExpiry = () => {
  return window.sessionStorage.getItem("id_token_expiry");
};

export const setTokenExpiry = (expiry) => {
  window.sessionStorage.setItem("id_token_expiry", expiry);
};

export const setUser = (user) => {
  window.sessionStorage.setItem("user", user);
};

export const getUser = () => {
  return window.sessionStorage.getItem("user");
};

export const destroyUser = () => {
  window.sessionStorage.removeItem("user");
};

export const distroySession = () => {
  window.sessionStorage.clear();
};

export default {
  getUser,
  setUser,
  getToken,
  setToken,
  destroyToken,
  getTokenExpiry,
  setTokenExpiry,
  distroySession,
};
