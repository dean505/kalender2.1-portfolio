// src/pages/UserPage.js
import React, { useCallback, useEffect, useMemo, useState } from "react";
import moment from "moment";
import "moment/locale/de";
import { useNavigate } from "react-router-dom";
import { parseJwt } from "../utils/jwt";
import { fetchWithAuth } from "../utils/api";
import { getWeekDates } from "../utils/appointmentSlots";
import "../assets/style.css";
import WeekPicker from "../components/WeekPicker";

moment.locale("de");

const STEP = { PICK_CATEGORY: 1, PICK_TIME: 2 };

export default function UserPage() {
  const navigate = useNavigate();

  // auth / user
  const [username, setUsername] = useState("");

  // data
  const [categories, setCategories] = useState([]);     // [{ id, name, description, durationMinutes, price }]
  const [myBookings, setMyBookings] = useState([]);     // [{ id, appointmentTime, categoryId, categoryName }]
  const [busyTimes, setBusyTimes] = useState([]);       // ISO-Strings (Startzeiten)

  // days disabled in WeekPicker (Vergangenheit + gesperrt)
  const [disabledDays, setDisabledDays] = useState(new Set()); // Set("YYYY-MM-DD")

  // steps / selection
  const [step, setStep] = useState(STEP.PICK_CATEGORY);
  const [selectedCat, setSelectedCat] = useState(null);
  const [selectedDate, setSelectedDate] = useState(""); // "YYYY-MM-DD"
  const [selectedTime, setSelectedTime] = useState(""); // "HH:mm"

  // modal (Passwort ändern)
  const [pwdOpen, setPwdOpen] = useState(false);

  const appointmentISO = useMemo(
    () => (selectedDate && selectedTime ? `${selectedDate}T${selectedTime}` : ""),
    [selectedDate, selectedTime]
  );

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) return navigate("/login");
    const decoded = parseJwt(token);
    if (!decoded || (decoded.role !== "ROLE_USER" && decoded.role !== "ROLE_ADMIN")) {
      alert("Kein Zugriff");
      return navigate("/login");
    }
    setUsername(decoded.sub || decoded.name || "");
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadInitial() {
    const [cats, mine, busy] = await Promise.all([
      fetchWithAuth("/api/categories"),
      fetchWithAuth("/api/bookings/me"),
      fetchWithAuth("/api/bookings/alle-zeiten"),
    ]);
    setCategories(cats || []);
    const now = new Date(); now.setHours(0,0,0,0);
    setMyBookings((mine || []).filter(b => new Date(b.appointmentTime) >= now));
    setBusyTimes(busy || []);
  }

  // --- Schritt 2: SLOTS ---
  const [openInfo, setOpenInfo] = useState(null); // { start, end, gesperrt }
  const [slots, setSlots] = useState([]); // ["HH:mm"]

  useEffect(() => {
    if (!selectedDate || !selectedCat) {
      setOpenInfo(null);
      setSlots([]);
      return;
    }
    (async () => {
      // 1) Arbeitstag gesperrt?
      const wt = await fetchWithAuth(`/api/arbeitstag/datum/${selectedDate}`).catch(() => null);
      if (wt?.istGesperrt) {
        setOpenInfo({ gesperrt: true });
        setSlots([]);
        return;
      }
      // 2) Öffnungszeiten
      const oh = await fetchWithAuth(`/api/oeffnungszeiten/datum/${selectedDate}`).catch(() => null);
      const startUhrzeit = oh?.startUhrzeit;
      const endUhrzeit   = oh?.endUhrzeit;
      setOpenInfo({ start: startUhrzeit, end: endUhrzeit, gesperrt: false });

      if (!startUhrzeit || !endUhrzeit) {
        setSlots([]);
        return;
      }

      // 3) Slots erzeugen
      const duration = selectedCat.durationMinutes ?? 40;
      const stepMin  = 15;
      const day      = moment(selectedDate, "YYYY-MM-DD");
      const dayStart = day.clone().set({
        hour: Number(startUhrzeit.split(":")[0]),
        minute: Number(startUhrzeit.split(":")[1]),
        second: 0, millisecond: 0,
      });
      const dayEnd = day.clone().set({
        hour: Number(endUhrzeit.split(":")[0]),
        minute: Number(endUhrzeit.split(":")[1]),
        second: 0, millisecond: 0,
      });

      const possible = [];
      for (let t = dayStart.clone(); ; t.add(stepMin, "minute")) {
        const end = t.clone().add(duration, "minute");
        if (end.isAfter(dayEnd) || t.isSameOrAfter(dayEnd)) break;
        possible.push(t.format("HH:mm"));
      }

      // 4) belegte Zeiten dieses Tages rausfiltern
      const busyThisDay = (busyTimes || [])
        .filter(iso => iso.startsWith(selectedDate))
        .map(iso => moment(iso));

      const available = possible.filter((hhmm) => {
        const start = moment(`${selectedDate}T${hhmm}`);
        const end   = start.clone().add(duration, "minute");
        // konservative Intervall-Überlappung (Busy als Block von "duration")
        return !busyThisDay.some((bStart) => {
          const busyStart = moment(bStart);
          const busyEnd   = busyStart.clone().add(duration, "minute");
          return start.isBefore(busyEnd) && end.isAfter(busyStart);
        });
      });

      setSlots(available);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedCat, busyTimes]);

  const refreshDisabledForWeek = useCallback(async (anchor) => {
    const weekDates = getWeekDates(anchor || moment().format("YYYY-MM-DD"));
    const results = await Promise.all(
      weekDates.map(d => fetchWithAuth(`/api/arbeitstag/datum/${d}`).catch(() => null))
    );

    const s = new Set();
    results.forEach((wd, idx) => {
      const d = weekDates[idx];
      if (wd?.istGesperrt === true) s.add(d);
    });

    const today = moment().format("YYYY-MM-DD");
    weekDates.forEach(d => {
      if (moment(d).isBefore(today, "day")) s.add(d);
    });

    setDisabledDays(s);
  }, []);

  // --- Gesperrte Tage der aktuellen Woche laden (und Vergangenheit sperren) ---
  useEffect(() => {
    refreshDisabledForWeek(selectedDate || moment().format("YYYY-MM-DD"));
  }, [refreshDisabledForWeek, selectedDate]);


  async function createBooking() {
    if (!selectedCat || !appointmentISO) return;
    const iso = appointmentISO.length === 16 ? `${appointmentISO}:00` : appointmentISO; // Sekunden anhängen
    await fetchWithAuth("/api/bookings", "POST", {
      appointmentTime: iso,
      categoryId: selectedCat.id,
    });
    alert("Buchung erfolgreich");
    setStep(STEP.PICK_CATEGORY);
    setSelectedCat(null);
    setSelectedDate("");
    setSelectedTime("");
    await loadInitial();
  }

  function isPastToday(dateISO, hhmm) {
    // nur für "heute" prüfen
    const today = moment().format("YYYY-MM-DD");
    if (dateISO !== today) return false;
    const slot = moment(`${dateISO}T${hhmm}`, "YYYY-MM-DDTHH:mm");
    return slot.isBefore(moment());
  }

  function logout() {
    localStorage.removeItem("jwt");
    navigate("/login");
  }

  // --- UI ---
  return (
    <div className="page-wrap">
      <h2>Willkommen, {username}</h2>

      {step === STEP.PICK_CATEGORY && (
        <section className="admin-card">
          <h3>Leistungen wählen</h3>
          <div className="pill-grid">
            {categories.map(c => (
              <button
                key={c.id}
                className={`pill ${selectedCat?.id === c.id ? "pill--active" : ""}`}
                onClick={() => {
                  setSelectedCat(c);
                  setStep(STEP.PICK_TIME);
                  setSelectedDate(moment().format("YYYY-MM-DD"));
                }}
              >
                <div className="pill__title">{c.name}</div>
                {c.description && <div className="pill__meta">{c.description}</div>}
                <div className="pill__meta">
                  {(c.durationMinutes ?? 40)} Min{c.price ? ` · ${Number(c.price).toFixed(2)} €` : ""}
                </div>
              </button>
            ))}
            {categories.length === 0 && <div className="muted">Keine Leistungen verfügbar.</div>}
          </div>
        </section>
      )}

      {step === STEP.PICK_TIME && selectedCat && (
        <section className="admin-card">
          <div className="toolbar">
            <button
              className="btn btn--light"
              onClick={() => { setStep(STEP.PICK_CATEGORY); setSelectedCat(null); }}
            >
              ← Zurück
            </button>
            <strong>{selectedCat.name}</strong>
            <span className="muted">
              {(selectedCat.durationMinutes ?? 40)} Min
              {selectedCat.price ? ` · ${Number(selectedCat.price).toFixed(2)} €` : ""}
            </span>
          </div>

          {/* Zwei Spalten: links Kalender/Slots, rechts kompakte Zusammenfassung */}
          <div className="booking-layout">
            <div>
              <label className="label">Wählen Sie einen Tag und eine Uhrzeit</label>
              <WeekPicker
                value={selectedDate || moment().format("YYYY-MM-DD")}
                onChange={(d) => { setSelectedDate(d); setSelectedTime(""); }}
                minDate={moment().format("YYYY-MM-DD")}
                disabledDates={disabledDays}
                onWeekVisible={refreshDisabledForWeek}
              />

              {selectedDate && (
                <div style={{ marginTop: 8, color: openInfo?.gesperrt ? "#b91c1c" : "#6b7280" }}>
                  {!openInfo
                    ? "Lade Öffnungszeiten..."
                    : openInfo.gesperrt
                      ? "An diesem Tag sind keine Buchungen möglich (gesperrt)."
                      : openInfo.start && openInfo.end
                        ? `Geöffnet: ${openInfo.start} - ${openInfo.end}`
                        : "Für diesen Tag sind keine Öffnungszeiten hinterlegt."}
                </div>
              )}

              {selectedDate && !openInfo?.gesperrt && openInfo?.start && openInfo?.end && (
                <>
                  <div style={{ margin: "8px 0" }}>Welche Zeit passt Ihnen am besten?</div>
                  <div className="slot-grid">
                    {slots.map((t) => {
                      const past = isPastToday(selectedDate, t);
                      return (
                        <button
                          key={t}
                          className={`slot ${selectedTime === t ? "slot--active" : ""}`}
                          disabled={past}
                          onClick={() => !past && setSelectedTime(t)}
                          title={past ? "Zeitpunkt ist bereits vorbei" : ""}
                        >
                          {t}
                        </button>
                      );
                    })}
                    {slots.length === 0 && <div className="muted">Keine freien Zeiten.</div>}
                  </div>
                </>
              )}
            </div>

            {/* rechte Spalte */}
            <div className="side-card">
              <h4>Ihr Termin</h4>
              <div className="side-card__row"><strong>Leistung:</strong> {selectedCat.name}</div>
              {selectedCat.durationMinutes != null && (
                <div className="side-card__row"><strong>Dauer:</strong> {selectedCat.durationMinutes} Min</div>
              )}
              {selectedCat.price != null && (
                <div className="side-card__row"><strong>Gesamtbetrag:</strong> {Number(selectedCat.price).toFixed(2)} €</div>
              )}
              <div className="side-card__row">
                <strong>Datum:</strong> {selectedDate ? moment(selectedDate).format("DD.MM.YYYY") : "-"}
              </div>
              <div className="side-card__row"><strong>Uhrzeit:</strong> {selectedTime || "-"}</div>
              <button
                className="btn btn--primary"
                style={{ width: "100%", marginTop: 10 }}
                disabled={!selectedDate || !selectedTime}
                onClick={createBooking}
              >
                Weiter
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="admin-card">
        <h3>Meine Buchungen</h3>
        <ul className="list">
          {myBookings.map(b => (
            <li key={b.id} className="list-row">
              <div>
                <strong>{moment(b.appointmentTime).format("DD.MM.YYYY HH:mm")}</strong>{" "}
                - {b.categoryName || (categories.find(c => c.id === b.categoryId)?.name || "Kategorie")}
              </div>
            </li>
          ))}
          {myBookings.length === 0 && <li>Keine zukünftigen Buchungen.</li>}
        </ul>
      </section>

      {/* Passwort-Modal einhängen */}
      <ChangePasswordModal
        open={pwdOpen}
        onClose={() => setPwdOpen(false)}
        onSaved={() => setPwdOpen(false)}
      />

      {/* gemeinsame Footer-Aktionen unten rechts */}
      <div className="footer-actions">
        <button className="btn btn--light" onClick={() => setPwdOpen(true)}>
          Passwort ändern
        </button>
        <button className="btn btn--danger" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}

/* ----------------- Sub-Komponente: Passwort ändern ----------------- */
function ChangePasswordModal({ open, onClose, onSaved }) {
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
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }

    try {
      setSaving(true);
      await fetchWithAuth("/api/users/me/password", "PUT", {
        currentPassword,
        newPassword,
      });
      alert("Passwort wurde aktualisiert.");
      setCurrentPassword(""); setNewPassword(""); setNewPassword2("");
      onSaved?.();
    } catch (err) {
      setError(err?.message || "Ändern fehlgeschlagen.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <h3>Passwort ändern</h3>
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
