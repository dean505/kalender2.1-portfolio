import { fetchWithAuth } from "../utils/api";

export function listBookedSlots() {
  return fetchWithAuth("/api/bookings/alle-zeiten");
}

export function listMyBookings() {
  return fetchWithAuth("/api/bookings/me");
}

export function createUserBooking({ appointmentTime, categoryId }) {
  return fetchWithAuth("/api/bookings", "POST", {
    appointmentTime,
    categoryId,
  });
}

export function listAdminBookings() {
  return fetchWithAuth("/admin/bookings");
}

export function listTodayBookings() {
  return fetchWithAuth("/admin/bookings/today");
}

export function listUnconfirmedBookings() {
  return fetchWithAuth("/admin/bookings/unconfirmed");
}

export function createAdminBooking(payload) {
  return fetchWithAuth("/admin/bookings", "POST", payload);
}

export function cancelAdminBooking(id) {
  return fetchWithAuth(`/admin/bookings/${id}`, "DELETE");
}

export function confirmBooking(id) {
  return fetchWithAuth(`/admin/bookings/${id}/confirm`, "PUT");
}

export function rejectBooking(id) {
  return fetchWithAuth(`/admin/bookings/${id}/reject`, "PUT");
}
