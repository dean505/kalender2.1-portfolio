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

function masterQuery(masterId) {
  return masterId ? `?masterId=${encodeURIComponent(masterId)}` : "";
}

export function updateWorkday(date, istGesperrt, masterId) {
  return fetchWithAuth(`/admin/arbeitstag/datum/${date}${masterQuery(masterId)}`, "PUT", { istGesperrt });
}

export function updateOpeningHours(date, startUhrzeit, endUhrzeit, masterId) {
  return fetchWithAuth(`/admin/oeffnungszeiten/datum/${date}${masterQuery(masterId)}`, "PUT", {
    startUhrzeit,
    endUhrzeit,
  });
}
