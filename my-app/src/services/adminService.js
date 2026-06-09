import { fetchWithAuth } from "../utils/api";

export function listUsers() {
  return fetchWithAuth("/admin/users");
}

export function updateUserRole(userId, role) {
  return fetchWithAuth(`/admin/users/${userId}/role`, "PUT", { role });
}

export function deleteUser(userId) {
  return fetchWithAuth(`/admin/users/${userId}`, "DELETE");
}

export function updateWorkday(date, istGesperrt) {
  return fetchWithAuth(`/admin/arbeitstag/datum/${date}`, "PUT", { istGesperrt });
}

export function updateOpeningHours(date, startUhrzeit, endUhrzeit) {
  return fetchWithAuth(`/admin/oeffnungszeiten/datum/${date}`, "PUT", {
    startUhrzeit,
    endUhrzeit,
  });
}
