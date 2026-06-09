// src/pages/UserPage.js
import React, { useEffect, useMemo, useState } from "react";
import moment from "moment";
import "moment/locale/de";
import { useNavigate } from "react-router-dom";
import { useBookingSchedule } from "../hooks/useBookingSchedule";
import { useAuthGuard } from "../hooks/useAuthGuard";
import { listCategories } from "../services/categoryService";
import { createUserBooking, listBookedSlots, listMyBookings } from "../services/bookingService";
import "../assets/style.css";
import SchedulePicker from "../components/SchedulePicker";
import { clearToken } from "../services/sessionService";
import ChangePasswordModal from "../components/ChangePasswordModal";

moment.locale("de");

const STEP = { PICK_CATEGORY: 1, PICK_TIME: 2 };
const USER_ROLES = ["ROLE_USER", "ROLE_ADMIN"];
const USER_WORKDAY_PATH = (date) => `/api/arbeitstag/datum/${date}`;
const USER_OPENING_HOURS_PATH = (date) => `/api/oeffnungszeiten/datum/${date}`;

export default function UserPage() {
  const navigate = useNavigate();
  const currentUser = useAuthGuard(USER_ROLES);

  // auth / user
  const [username, setUsername] = useState("");

  // data
  const [categories, setCategories] = useState([]);     // [{ id, name, description, durationMinutes, price }]
  const [myBookings, setMyBookings] = useState([]);     // [{ id, appointmentTime, categoryId, categoryName }]
  const [busyTimes, setBusyTimes] = useState([]);       // ISO-Strings (Startzeiten)

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
    if (!currentUser) return;
    setUsername(currentUser.sub || currentUser.name || "");
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  async function loadInitial() {
    const [cats, mine, busy] = await Promise.all([
      listCategories(),
      listMyBookings(),
      listBookedSlots(),
    ]);
    setCategories(cats || []);
    const now = new Date(); now.setHours(0,0,0,0);
    setMyBookings((mine || []).filter(b => new Date(b.appointmentTime) >= now));
    setBusyTimes(busy || []);
  }

  const {
    disabledDays,
    openInfo,
    refreshDisabledForWeek,
    slots,
  } = useBookingSchedule({
    selectedDate,
    selectedCategory: selectedCat,
    busyTimes,
    workdayPath: USER_WORKDAY_PATH,
    openingHoursPath: USER_OPENING_HOURS_PATH,
  });


  async function createBooking() {
    if (!selectedCat || !appointmentISO) return;
    const iso = appointmentISO.length === 16 ? `${appointmentISO}:00` : appointmentISO; // Sekunden anhängen
    await createUserBooking({
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
    clearToken();
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
            <SchedulePicker
              disabledDays={disabledDays}
              isSlotDisabled={(time) => isPastToday(selectedDate, time)}
              onDateChange={setSelectedDate}
              onTimeChange={setSelectedTime}
              onWeekVisible={refreshDisabledForWeek}
              openInfo={openInfo}
              prompt="Welche Zeit passt Ihnen am besten?"
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              slots={slots}
            />

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
          Passwort aendern
        </button>
        <button className="btn btn--danger" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}
