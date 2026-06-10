import React, { useEffect, useMemo, useState } from "react";
import { updateOpeningHours, updateWorkday } from "../services/adminService";

export default function AdminWorkdaySettings({
  masters = [],
  currentMasterId,
  onOpeningHoursUpdated,
  onWorkdayUpdated,
}) {
  const [workdayDialogOpen, setWorkdayDialogOpen] = useState(false);
  const [hoursDialogOpen, setHoursDialogOpen] = useState(false);
  const [selectedMasterId, setSelectedMasterId] = useState("");
  const [lockForm, setLockForm] = useState({ date: "", lock: "true" });
  const [hoursForm, setHoursForm] = useState({ date: "", open: "", close: "" });

  const activeMasters = useMemo(
    () => masters.filter((master) => master.active !== false),
    [masters]
  );

  useEffect(() => {
    if (selectedMasterId && activeMasters.some((master) => String(master.id) === String(selectedMasterId))) {
      return;
    }

    setSelectedMasterId(activeMasters[0]?.id ? String(activeMasters[0].id) : "");
  }, [activeMasters, selectedMasterId]);

  function getPreferredMasterId() {
    if (currentMasterId && activeMasters.some((master) => String(master.id) === String(currentMasterId))) {
      return String(currentMasterId);
    }

    return activeMasters[0]?.id ? String(activeMasters[0].id) : "";
  }

  function openWorkdayDialog() {
    setSelectedMasterId(getPreferredMasterId());
    setWorkdayDialogOpen(true);
  }

  function openHoursDialog() {
    setSelectedMasterId(getPreferredMasterId());
    setHoursDialogOpen(true);
  }

  async function submitLock(e) {
    e.preventDefault();
    await updateWorkday(lockForm.date, lockForm.lock === "true", selectedMasterId);
    alert("Arbeitstag aktualisiert");
    setWorkdayDialogOpen(false);
    onWorkdayUpdated?.(lockForm.date, selectedMasterId);
  }

  async function submitHours(e) {
    e.preventDefault();
    await updateOpeningHours(hoursForm.date, hoursForm.open, hoursForm.close, selectedMasterId);
    alert("Oeffnungszeiten gespeichert");
    setHoursDialogOpen(false);
    onOpeningHoursUpdated?.(hoursForm.date, selectedMasterId);
  }

  return (
    <>
      <section className="admin-card">
        <h3>Arbeitstag verwalten</h3>
        <p className="muted">
          Sperre oder oeffne einzelne Tage fuer einen bestimmten Master.
        </p>
        <button
          className="btn btn--primary"
          type="button"
          onClick={openWorkdayDialog}
          disabled={activeMasters.length === 0}
        >
          Arbeitstag bearbeiten
        </button>
      </section>

      <section className="admin-card">
        <h3>Arbeitszeit verwalten</h3>
        <p className="muted">
          Neue Master bekommen automatisch Mo-Fr 09:00-16:00. Hier kannst du einzelne Tage anpassen.
        </p>
        <button
          className="btn btn--primary"
          type="button"
          onClick={openHoursDialog}
          disabled={activeMasters.length === 0}
        >
          Arbeitszeit bearbeiten
        </button>
      </section>

      <ScheduleDialog
        open={workdayDialogOpen}
        title="Arbeitstag bearbeiten"
        masters={activeMasters}
        selectedMasterId={selectedMasterId}
        onSelectMaster={setSelectedMasterId}
        onClose={() => setWorkdayDialogOpen(false)}
      >
        <form className="grid grid--1" onSubmit={submitLock}>
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
          <DialogActions onClose={() => setWorkdayDialogOpen(false)} disabled={!selectedMasterId} />
        </form>
      </ScheduleDialog>

      <ScheduleDialog
        open={hoursDialogOpen}
        title="Arbeitszeit bearbeiten"
        masters={activeMasters}
        selectedMasterId={selectedMasterId}
        onSelectMaster={setSelectedMasterId}
        onClose={() => setHoursDialogOpen(false)}
      >
        <form className="grid grid--1" onSubmit={submitHours}>
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
            <span className="label">Oeffnungszeit</span>
            <input
              type="time"
              className="input"
              value={hoursForm.open}
              onChange={(e) => setHoursForm({ ...hoursForm, open: e.target.value })}
              required
            />
          </label>
          <label>
            <span className="label">Schliesszeit</span>
            <input
              type="time"
              className="input"
              value={hoursForm.close}
              onChange={(e) => setHoursForm({ ...hoursForm, close: e.target.value })}
              required
            />
          </label>
          <DialogActions onClose={() => setHoursDialogOpen(false)} disabled={!selectedMasterId} />
        </form>
      </ScheduleDialog>
    </>
  );
}

function ScheduleDialog({ open, title, masters, selectedMasterId, onSelectMaster, onClose, children }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <label>
          <span className="label">Master</span>
          <select
            className="input"
            value={selectedMasterId}
            onChange={(e) => onSelectMaster(e.target.value)}
            required
          >
            {masters.map((master) => (
              <option key={master.id} value={master.id}>
                {master.name}
              </option>
            ))}
          </select>
        </label>
        {children}
      </div>
    </div>
  );
}

function DialogActions({ onClose, disabled }) {
  return (
    <div className="modal-actions">
      <button type="button" className="btn btn--light" onClick={onClose}>
        Abbrechen
      </button>
      <button type="submit" className="btn btn--primary" disabled={disabled}>
        Speichern
      </button>
    </div>
  );
}
