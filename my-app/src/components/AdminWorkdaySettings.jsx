import React, { useState } from "react";
import { updateOpeningHours, updateWorkday } from "../services/adminService";

export default function AdminWorkdaySettings({ onOpeningHoursUpdated, onWorkdayUpdated }) {
  const [lockForm, setLockForm] = useState({ date: "", lock: "true" });
  const [hoursForm, setHoursForm] = useState({ date: "", open: "", close: "" });

  async function submitLock(e) {
    e.preventDefault();
    await updateWorkday(lockForm.date, lockForm.lock === "true");
    alert("Arbeitstag aktualisiert");
    onWorkdayUpdated?.(lockForm.date);
  }

  async function submitHours(e) {
    e.preventDefault();
    await updateOpeningHours(hoursForm.date, hoursForm.open, hoursForm.close);
    alert("Öffnungszeiten gespeichert");
    onOpeningHoursUpdated?.(hoursForm.date);
  }

  return (
    <>
      <section className="admin-card">
        <h3>Arbeitstag verwalten</h3>
        <form className="grid grid--3" onSubmit={submitLock}>
          <label>
            <span className="label">Datum</span>
            <input
              type="date"
              className="input"
              value={lockForm.date}
              onChange={(e) => setLockForm({ ...lockForm, date: e.target.value })}
              required
            />
          </label>
          <label>
            <span className="label">Status</span>
            <select
              className="input"
              value={lockForm.lock}
              onChange={(e) => setLockForm({ ...lockForm, lock: e.target.value })}
            >
              <option value="true">Sperren</option>
              <option value="false">Freigeben</option>
            </select>
          </label>
          <div className="grid--align-end">
            <button className="btn btn--primary" type="submit">
              Speichern
            </button>
          </div>
        </form>
      </section>

      <section className="admin-card">
        <h3>Arbeitszeit verwalten</h3>
        <form className="grid grid--4" onSubmit={submitHours}>
          <label>
            <span className="label">Datum</span>
            <input
              type="date"
              className="input"
              value={hoursForm.date}
              onChange={(e) => setHoursForm({ ...hoursForm, date: e.target.value })}
              required
            />
          </label>
          <label>
            <span className="label">Öffnungszeit</span>
            <input
              type="time"
              className="input"
              value={hoursForm.open}
              onChange={(e) => setHoursForm({ ...hoursForm, open: e.target.value })}
              required
            />
          </label>
          <label>
            <span className="label">Schließzeit</span>
            <input
              type="time"
              className="input"
              value={hoursForm.close}
              onChange={(e) => setHoursForm({ ...hoursForm, close: e.target.value })}
              required
            />
          </label>
          <div className="grid--align-end">
            <button className="btn btn--primary" type="submit">
              Speichern
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
