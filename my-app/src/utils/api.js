// src/utils/api.js
const API_BASE = process.env.REACT_APP_API_BASE ?? "http://localhost:8080";

/**
 * Einheitlicher Fetch mit JWT und robuster Fehlerbehandlung.
 * - leitet bei 401 auf /login
 * - wirft Fehler mit HTTP-Details
 */
export async function fetchWithAuth(path, method = "GET", body) {
  const token = localStorage.getItem("jwt");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  if (res.status === 401) {
    localStorage.removeItem("jwt");
    window.location.href = "/login";
    return;
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
  }

  // ---- robustes Parsing ----
  const contentType = res.headers.get("content-type") || "";
  const contentLen  = res.headers.get("content-length");

  if (res.status === 204 || contentLen === "0") return null;     // No Content
  if (!contentType.includes("application/json")) {                // kein JSON -> Text/leer
    const text = await res.text().catch(() => "");
    return text || null;
  }
  const text = await res.text().catch(() => "");
  if (!text) return null;
  try { return JSON.parse(text); } catch { return null; }
}

