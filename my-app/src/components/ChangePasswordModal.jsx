import React, { useState } from "react";
import { changeMyPassword } from "../services/userService";

export default function ChangePasswordModal({ open, onClose, onSaved }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Das neue Passwort muss mindestens 8 Zeichen haben.");
      return;
    }
    if (newPassword !== newPassword2) {
      setError("Die Passwoerter stimmen nicht ueberein.");
      return;
    }

    try {
      setSaving(true);
      await changeMyPassword({ currentPassword, newPassword });
      alert("Passwort wurde aktualisiert.");
      setCurrentPassword("");
      setNewPassword("");
      setNewPassword2("");
      onSaved?.();
    } catch (err) {
      setError(err?.message || "Aendern fehlgeschlagen.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <h3>Passwort aendern</h3>
        <form className="grid grid--1" onSubmit={submit}>
          <label>
            <span className="label">Aktuelles Passwort</span>
            <input
              type="password"
              className="input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </label>
          <label>
            <span className="label">Neues Passwort</span>
            <input
              type="password"
              className="input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </label>
          <label>
            <span className="label">Neues Passwort (Wiederholung)</span>
            <input
              type="password"
              className="input"
              value={newPassword2}
              onChange={(e) => setNewPassword2(e.target.value)}
              required
            />
          </label>

          {error && <div className="muted" style={{ color: "var(--danger)" }}>{error}</div>}

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <button type="button" className="btn btn--light" onClick={onClose}>
              Abbrechen
            </button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? "Speichern..." : "Speichern"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
