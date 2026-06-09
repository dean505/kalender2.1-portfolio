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
    throw new Error(`Login fehlgeschlagen (${response.status}). ${text || ""}`);
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
    const error = new Error(text || `Fehler ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return response;
}
