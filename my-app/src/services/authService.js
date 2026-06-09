import { API_BASE } from "../utils/api";

export async function login({ email, password }) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const text = await response.text();
  let token;
  try {
    token = JSON.parse(text || "{}").token;
  } catch {}

  if (!response.ok) {
    throw new Error(`Login fehlgeschlagen (${response.status}). ${readErrorMessage(text)}`);
  }
  if (!token) {
    throw new Error("Login fehlgeschlagen: Server hat kein Token geliefert.");
  }

  return token;
}

export async function registerUser(payload) {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    const error = new Error(readErrorMessage(text) || `Fehler ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return response;
}

function readErrorMessage(text) {
  if (!text) return "";

  try {
    const payload = JSON.parse(text);
    if (payload.fieldErrors) {
      const fieldErrors = Object.entries(payload.fieldErrors)
        .map(([field, message]) => `${field}: ${message}`)
        .join(", ");
      return fieldErrors || payload.message || text;
    }
    return payload.message || text;
  } catch {
    return text;
  }
}
