import { fetchWithAuth } from "../utils/api";

export function listCategories() {
  return fetchWithAuth("/api/categories");
}

export function saveCategory(category) {
  const { id, name, description, durationMinutes } = category;
  const body = {
    name,
    description,
    durationMinutes: Number(durationMinutes),
  };

  return fetchWithAuth(
    id ? `/admin/categories/${id}` : "/admin/categories",
    id ? "PUT" : "POST",
    body
  );
}

export function deleteCategory(id) {
  return fetchWithAuth(`/admin/categories/${id}`, "DELETE");
}
