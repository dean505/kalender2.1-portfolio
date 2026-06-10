import React, { useEffect, useState } from "react";
import { deleteMaster, listAdminMasters, saveMaster } from "../services/masterService";

const EMPTY_MASTER = {
  id: null,
  name: "",
  description: "",
  active: true,
};

export default function AdminMasterManager({ onChanged }) {
  const [masters, setMasters] = useState([]);
  const [form, setForm] = useState(EMPTY_MASTER);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMasters();
  }, []);

  async function loadMasters() {
    const data = await listAdminMasters().catch(() => []);
    setMasters(data || []);
  }

  function edit(master) {
    setForm({
      id: master.id,
      name: master.name || "",
      description: master.description || "",
      active: Boolean(master.active),
    });
    setError("");
  }

  function reset() {
    setForm(EMPTY_MASTER);
    setError("");
  }

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Name muss ausgefuellt sein.");
      return;
    }

    try {
      setSaving(true);
      await saveMaster(form);
      reset();
      await loadMasters();
      await onChanged?.();
    } catch (err) {
      setError(err?.message || "Master konnte nicht gespeichert werden.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(master) {
    if (!window.confirm(`Master "${master.name}" loeschen?`)) return;

    try {
      await deleteMaster(master.id);
      await loadMasters();
      await onChanged?.();
    } catch (err) {
      alert(err?.message || "Master konnte nicht geloescht werden.");
    }
  }

  return (
    <section className="admin-card">
      <div className="toolbar">
        <h3 style={{ margin: 0 }}>Master verwalten</h3>
      </div>

      <form className="grid grid--3" onSubmit={submit}>
        <label>
          <span className="label">Name</span>
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm((m) => ({ ...m, name: e.target.value }))}
            placeholder="z.B. Anna"
          />
        </label>

        <label>
          <span className="label">Beschreibung</span>
          <input
            className="input"
            value={form.description}
            onChange={(e) => setForm((m) => ({ ...m, description: e.target.value }))}
            placeholder="z.B. Kosmetik, Haare, Beratung"
          />
        </label>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm((m) => ({ ...m, active: e.target.checked }))}
          />
          Aktiv
        </label>

        {error && <div className="muted grid--full" style={{ color: "var(--danger)" }}>{error}</div>}

        <div className="grid--full row-actions">
          <button className="btn btn--primary" type="submit" disabled={saving}>
            {saving ? "Speichern..." : form.id ? "Aendern" : "Hinzufuegen"}
          </button>
          {form.id && (
            <button className="btn btn--light" type="button" onClick={reset}>
              Abbrechen
            </button>
          )}
        </div>
      </form>

      <ul className="list" style={{ marginTop: 12 }}>
        {masters.map((master) => (
          <li key={master.id} className="list-row">
            <div>
              <strong>{master.name}</strong>{" "}
              {master.defaultMaster && <span className="badge">Standard</span>}
              {!master.active && <span className="badge">Inaktiv</span>}
              {master.description && <div className="muted">{master.description}</div>}
            </div>
            <div className="row-actions">
              <button className="btn btn--light" type="button" onClick={() => edit(master)}>
                Bearbeiten
              </button>
              <button
                className="btn btn--danger"
                type="button"
                disabled={master.defaultMaster}
                onClick={() => remove(master)}
              >
                Loeschen
              </button>
            </div>
          </li>
        ))}
        {masters.length === 0 && <li>Keine Master vorhanden.</li>}
      </ul>
    </section>
  );
}
