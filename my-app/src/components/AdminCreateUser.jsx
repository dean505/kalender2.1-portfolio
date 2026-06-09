import React, { useState } from "react";
import { API_BASE } from "../utils/api";

const EMPTY_FORM = {
  name: "",
  email: "",
  telefonnummer: "",
  password: "",
  role: "USER",
};

export default function AdminCreateUser({ onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          telefonnummer: form.telefonnummer.trim(),
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Fehler ${res.status}`);
      }

      await onCreated?.(form.email, form.role);
      alert("Benutzer wurde angelegt.");
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err?.message || "Unbekannter Fehler");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="grid grid--3" onSubmit={handleSubmit}>
      <label className="grid--full">
        <span className="label">Name</span>
        <input
          className="input"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          required
        />
      </label>

      <label>
        <span className="label">E-Mail</span>
        <input
          type="email"
          className="input"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          required
        />
      </label>

      <label>
        <span className="label">Telefon</span>
        <input
          className="input"
          value={form.telefonnummer}
          onChange={(e) => updateField("telefonnummer", e.target.value)}
          required
        />
      </label>

      <label>
        <span className="label">Passwort</span>
        <input
          type="password"
          className="input"
          value={form.password}
          onChange={(e) => updateField("password", e.target.value)}
          required
        />
      </label>

      <label>
        <span className="label">Rolle</span>
        <select
          className="input"
          value={form.role}
          onChange={(e) => updateField("role", e.target.value)}
        >
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </label>

      <div className="grid--align-end">
        <button className="btn btn--primary" type="submit" disabled={saving}>
          {saving ? "Speichern..." : "Benutzer anlegen"}
        </button>
      </div>

      {error && (
        <div className="grid--full muted" style={{ color: "var(--danger)" }}>
          {error}
        </div>
      )}
    </form>
  );
}
