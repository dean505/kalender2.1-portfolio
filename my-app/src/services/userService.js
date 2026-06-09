import { fetchWithAuth } from "../utils/api";

export function changeMyPassword({ currentPassword, newPassword }) {
  return fetchWithAuth("/api/users/me/password", "PUT", {
    currentPassword,
    newPassword,
  });
}
