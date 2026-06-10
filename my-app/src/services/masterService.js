import { fetchWithAuth } from "../utils/api";

export function listMasters() {
  return fetchWithAuth("/api/masters");
}

export function listAdminMasters() {
  return fetchWithAuth("/admin/masters");
}

export function saveMaster(master) {
  const body = {
    name: master.name,
    description: master.description || "",
    active: Boolean(master.active),
  };

  return fetchWithAuth(
    master.id ? `/admin/masters/${master.id}` : "/admin/masters",
    master.id ? "PUT" : "POST",
    body
  );
}

export function deleteMaster(id) {
  return fetchWithAuth(`/admin/masters/${id}`, "DELETE");
}
