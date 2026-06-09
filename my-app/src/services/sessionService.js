import { parseJwt } from "../utils/jwt";

const TOKEN_KEY = "jwt";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getCurrentUser() {
  const token = getToken();
  return token ? parseJwt(token) : null;
}

export function getRoleRedirect(role) {
  return role === "ROLE_ADMIN" || role === "ROLE_SUPERADMIN" ? "/admin" : "/user";
}
