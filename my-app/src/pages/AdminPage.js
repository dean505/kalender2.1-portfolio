// src/pages/AdminPage.js
import React, { useEffect, useMemo, useState } from "react";
import moment from "moment";
import "moment/locale/de";
import { useNavigate } from "react-router-dom";
import { parseJwt } from "../utils/jwt";
import { fetchWithAuth } from "../utils/api";
import { useBookingSchedule } from "../hooks/useBookingSchedule";
import AdminCreateUser from "../components/AdminCreateUser";
import SchedulePicker from "../components/SchedulePicker";
import "../assets/style.css";

moment.locale("de");

// ✨ Tabs
const TAB = { CREATE_APPT: "CREATE_APPT", CREATE_USER: "CREATE_USER" };
const ADMIN_WORKDAY_PATH = (date) => `/admin/arbeitstag/datum/${date}`;
const ADMIN_OPENING_HOURS_PATH = (date) => `/admin/oeffnungszeiten/datum/${date}`;

export default function AdminPage() {
  const navigate = useNavigate();

  // ───────────────── Auth ─────────────────
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) return navigate("/login");
    const decoded = parseJwt(token);
    if (!decoded || (decoded.role !== "ROLE_ADMIN" && decoded.role !== "ROLE_SUPERADMIN")) {
      alert("Kein Zugriff");
      return navigate("/login");
    }
    setAdminName(decoded.sub || decoded.name || "");

    // Initial loads
    loadInitial();
    loadUnconfirmed();
    loadUsersAdmin();
    loadToday();
    loadAllBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function logout() {
    localStorage.removeItem("jwt");
    navigate("/login");
  }

  // ✨ Tab-State
  const [tab, setTab] = useState(TAB.CREATE_APPT);

  // ───────────────── Termin anlegen ─────────────────
  // Nutzer-Suche (nur 1 Nutzer auswählbar)
  const [allUsers, setAllUsers] = useState([]);
  const [userQuery, setUserQuery] = useState("");
  const [userCandidates, setUserCandidates] = useState([]);
  const [pickedUser, setPickedUser] = useState(null); // {id,name,email,role}
  const [selectedDate, setSelectedDate] = useState(""); // 'YYYY-MM-DD'
  const [selectedTime, setSelectedTime] = useState(""); // 'HH:mm'

  async function loadUsersAdmin() {
    const data = await fetchWithAuth("/admin/users").catch(() => []);
    setAllUsers(data || []);
  }

  useEffect(() => {
    if (!userQuery.trim()) {
      setUserCandidates([]);
      return;
    }
    const q = userQuery.toLowerCase();
    const list = (allUsers || [])
      .filter(
        (u) =>
          (u.name || "").toLowerCase().includes(q) ||
          (u.email || "").toLowerCase().includes(q)
      )
      .slice(0, 5);
    setUserCandidates(list);
  }, [userQuery, allUsers]);

  // Kategorien + belegte Zeiten
  const [categories, setCategories] = useState([]);
  const [busyTimes, setBusyTimes] = useState([]); // ISO-Startzeiten (global)

  async function loadInitial() {
    const [cats, busy] = await Promise.all([
      fetchWithAuth("/api/categories"),
      fetchWithAuth("/api/bookings/alle-zeiten"),
    ]);
    setCategories(cats || []);
    setBusyTimes(busy || []);
  }

  const [selectedCat, setSelectedCat] = useState(null);

  const {
    disabledDays,
    openInfo,
    refreshDisabledForWeek,
    slots,
  } = useBookingSchedule({
    selectedDate,
    selectedCategory: selectedCat,
    busyTimes,
    workdayPath: ADMIN_WORKDAY_PATH,
    openingHoursPath: ADMIN_OPENING_HOURS_PATH,
  });

  async function createAdminBooking() {
    if (!pickedUser?.id) { alert("Bitte zuerst einen Benutzer auswählen."); return; }
    if (!selectedCat?.id) { alert("Bitte eine Kategorie auswählen."); return; }
    if (!selectedDate || !selectedTime) { alert("Bitte Datum und Uhrzeit wählen."); return; }

    const appointmentTime = `${selectedDate}T${selectedTime}:00`;
    const payload = {
      userId: Number(pickedUser.id),
      categoryId: Number(selectedCat.id),
      appointmentTime
    };

    try {
      await fetchWithAuth("/admin/bookings", "POST", payload);
      alert("Termin wurde angelegt.");
      setSelectedTime("");
      await Promise.all([
        loadAllBookings(),
        loadToday(),
        loadUnconfirmed(),
        (async () => {
          const busy = await fetchWithAuth("/api/bookings/alle-zeiten").catch(() => []);
          setBusyTimes(busy || []);
        })()
      ]);
    } catch (e) {
      const msg = (e && e.message) ? e.message : "Unbekannter Fehler";
      if (msg.toLowerCase().includes("konflikt") || msg.includes("409")) {
        alert("Zeitkollision mit einer bestehenden Buchung.");
      } else if (msg.includes("403")) {
        alert("Keine Berechtigung (ADMIN erforderlich).");
      } else if (msg.includes("400")) {
        alert("Ungültige Eingabe.");
      } else {
        alert("Fehler: " + msg);
      }
    }
  }

  // ───────────────── Heute / Unconfirmed / All ─────────────────
  const [todayBookings, setTodayBookings] = useState([]);
  async function loadToday() {
    const todays = await fetchWithAuth("/admin/bookings/today").catch(() => []);
    setTodayBookings(todays || []);
  }

  const [unconfirmed, setUnconfirmed] = useState([]);
  async function loadUnconfirmed() {
    const data = await fetchWithAuth("/admin/bookings/unconfirmed").catch(() => []);
    setUnconfirmed(data || []);
  }
  async function confirmBooking(id) {
    await fetchWithAuth(`/admin/bookings/${id}/confirm`, "PUT");
    loadUnconfirmed();
    loadToday();
  }
  async function rejectBooking(id) {
    await fetchWithAuth(`/admin/bookings/${id}/reject`, "PUT");
    loadUnconfirmed();
    loadToday();
  }

  const [allBookings, setAllBookings] = useState([]);
  const [bookingsPage, setBookingsPage] = useState(0);
  const bookingsPerPage = 5;
  const [bookingSearch, setBookingSearch] = useState("");

  async function loadAllBookings() {
    let arr = await fetchWithAuth("/admin/bookings").catch(() => []);
    const now = new Date();
    arr = (arr || []).filter((b) => new Date(b.appointmentTime) >= now);
    setAllBookings(arr);
  }

  const filteredBookings = useMemo(() => {
    const q = bookingSearch.toLowerCase();
    return (allBookings || []).filter(
      (b) =>
        (b.userName || "").toLowerCase().includes(q) ||
        (b.categoryName || "").toLowerCase().includes(q)
    );
  }, [allBookings, bookingSearch]);

  const bookingsSlice = useMemo(() => {
    const start = bookingsPage * bookingsPerPage;
    return filteredBookings.slice(start, start + bookingsPerPage);
  }, [filteredBookings, bookingsPage]);

  async function cancelBookingAdmin(id) {
    if (!window.confirm("Termin stornieren?")) return;
    await fetchWithAuth(`/admin/bookings/${id}`, "DELETE");
    loadAllBookings();
    loadToday();
  }

  // ───────────────── Kategorien ─────────────────
  const [catFormOpen, setCatFormOpen] = useState(false);
  const [catListOpen, setCatListOpen] = useState(false);
  const [catForm, setCatForm] = useState({
    id: "",
    name: "",
    description: "",
    durationMinutes: "",
  });

  async function reloadCategories() {
    const cats = await fetchWithAuth("/api/categories");
    setCategories(cats || []);
  }

  async function saveCategory(e) {
    e.preventDefault();
    const { id, name, description, durationMinutes } = catForm;
    const body = {
      name,
      description,
      durationMinutes: Number(durationMinutes),
    };
    const method = id ? "PUT" : "POST";
    const url = id ? `/admin/categories/${id}` : "/admin/categories";
    await fetchWithAuth(url, method, body);
    alert(`Kategorie ${id ? "aktualisiert" : "erstellt"}.`);
    setCatForm({ id: "", name: "", description: "", durationMinutes: "" });
    reloadCategories();
  }

  function editCategory(cat) {
    setCatForm({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      durationMinutes: cat.durationMinutes ?? 40,
    });
    setCatFormOpen(true);
  }

  async function deleteCategory(id) {
    if (!window.confirm("Kategorie wirklich löschen?")) return;
    await fetchWithAuth(`/admin/categories/${id}`, "DELETE");
    reloadCategories();
  }

  async function submitLock(e) {
    e.preventDefault();
    await fetchWithAuth(`/admin/arbeitstag/datum/${lockForm.date}`, "PUT", {
      istGesperrt: lockForm.lock === "true",
    });
    alert("Arbeitstag aktualisiert");
    refreshDisabledForWeek(lockForm.date);
  }
  async function submitHours(e) {
    e.preventDefault();
    await fetchWithAuth(`/admin/oeffnungszeiten/datum/${hoursForm.date}`, "PUT", {
      startUhrzeit: hoursForm.open,
      endUhrzeit: hoursForm.close,
    });
    alert("Öffnungszeiten gespeichert");
    if (selectedDate === hoursForm.date) {
      setSelectedTime("");
      setSelectedDate(hoursForm.date);
    }
  }

  const [lockForm, setLockForm] = useState({ date: "", lock: "true" });
  const [hoursForm, setHoursForm] = useState({ date: "", open: "", close: "" });

  function isPastToday(dateISO, hhmm) {
    const today = moment().format("YYYY-MM-DD");
    if (dateISO !== today) return false;
    const slot = moment(`${dateISO}T${hhmm}`, "YYYY-MM-DDTHH:mm");
    return slot.isBefore(moment());
  }

  // ───────────────── UI ─────────────────
  return (
    <div className="page-wrap">
      <header className="page-header">
        <h2>Willkommen, {adminName} (ADMIN)</h2>
      </header>

      {/* ✨ Browser-Style Tabs */}
      <div className="tabs tabs--browser">
        <button
          type="button"
          role="tab"
          className={`tab ${tab === TAB.CREATE_APPT ? "tab--active" : ""}`}
          onClick={() => setTab(TAB.CREATE_APPT)}
          aria-selected={tab === TAB.CREATE_APPT}
        >
          Termin anlegen
        </button>

        <button
          type="button"
          role="tab"
          className={`tab ${tab === TAB.CREATE_USER ? "tab--active" : ""}`}
          onClick={() => setTab(TAB.CREATE_USER)}
          aria-selected={tab === TAB.CREATE_USER}
        >
          Benutzer anlegen
        </button>
      </div>

      {/* ✨ Termin anlegen / Benutzer anlegen Umschalter */}
      {tab === TAB.CREATE_APPT && (
        <section className="admin-card">
          <div
            className="toolbar"
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            <h3 style={{ margin: 0 }}>Termin anlegen</h3>

          </div>

          {/* ── Inhalt: Termin anlegen (wie früher) ── */}
          <div className="grid grid--3" style={{ alignItems: "start" }}>
            {/* Nutzer suchen */}
            <div className="grid--full">
              <label className="label">Benutzer suchen</label>
              <input
                className="input"
                placeholder="Name oder E-Mail…"
                value={userQuery}
                onChange={(e) => {
                  setUserQuery(e.target.value);
                  setPickedUser(null);
                }}
              />
              {userQuery && userCandidates.length > 0 && (
                <div className="dropdown">
                  {userCandidates.map((u) => (
                    <button
                      key={u.id}
                      className="dropdown-item"
                      onClick={() => {
                        setPickedUser(u);
                        setUserQuery(`${u.name} (${u.email || u.username || ""})`);
                        setUserCandidates([]);
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>{u.name}</div>
                        <div className="muted" style={{ fontSize: 12 }}>
                          {u.email || u.username} • {u.role}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {pickedUser && (
                <div className="chip" style={{ marginTop: 8 }}>
                  <span>{pickedUser.name}</span>
                  <small className="muted">{pickedUser.email || pickedUser.username}</small>
                  <button
                    className="chip__x"
                    onClick={() => {
                      setPickedUser(null);
                    }}
                    title="Entfernen"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {/* Kategorien */}
            <div className="grid--full">
              <label className="label">Leistung</label>
              <div className="pill-grid">
                {(categories || []).map((c) => (
                  <button
                    key={c.id}
                    className={`pill ${selectedCat?.id === c.id ? "pill--active" : ""}`}
                    onClick={() => {
                      setSelectedCat(c);
                    }}
                  >
                    <div className="pill__title">{c.name}</div>
                    <div className="pill__meta">
                      {(c.durationMinutes ?? 40)} Min
                      {c.price ? ` • ${Number(c.price).toFixed(2)} €` : ""}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Schedule picker */}
            <div className="grid--full">
              <SchedulePicker
                disabledDays={disabledDays}
                isSlotDisabled={(time) => isPastToday(selectedDate, time)}
                onDateChange={setSelectedDate}
                onTimeChange={setSelectedTime}
                onWeekVisible={refreshDisabledForWeek}
                openInfo={openInfo}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                slots={slots}
              />
            </div>
          </div>

          {/* Zusammenfassung + Button */}
          <div className="side-card">
            <h4>Ihr Termin</h4>
            <div className="side-card__row">
              <strong>Leistung:</strong> {selectedCat?.name || "—"}
            </div>
            {selectedCat?.durationMinutes != null && (
              <div className="side-card__row">
                <strong>Dauer:</strong> {selectedCat.durationMinutes} Min
              </div>
            )}
            {selectedCat?.price != null && (
              <div className="side-card__row">
                <strong>Preis:</strong> {Number(selectedCat.price).toFixed(2)} €
              </div>
            )}
            <div className="side-card__row">
              <strong>Benutzer:</strong> {pickedUser?.name || "—"}
            </div>
            <div className="side-card__row">
              <strong>Datum:</strong> {selectedDate ? moment(selectedDate).format("DD.MM.YYYY") : "—"}
            </div>
            <div className="side-card__row">
              <strong>Uhrzeit:</strong> {selectedTime || "—"}
            </div>

            <button
              className="btn btn--primary"
              style={{ width: "100%", marginTop: 10 }}
              disabled={!pickedUser || !selectedCat || !selectedDate || !selectedTime}
              onClick={createAdminBooking}
            >
              Termin anlegen
            </button>
          </div>
        </section>
      )}

      {tab === TAB.CREATE_USER && (
        <section className="admin-card">
          <div
            className="toolbar"
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            <h3 style={{ margin: 0 }}>Benutzer anlegen</h3>
          </div>

          <AdminCreateUser
            onCreated={async (email, desiredRole) => {
              await loadUsersAdmin();
              const created = (allUsers || []).find(
                (u) => (u.email || "").toLowerCase() === (email || "").toLowerCase()
              );
              if (created && desiredRole && desiredRole !== "USER") {
                try {
                  await fetchWithAuth(`/admin/users/${created.id}/role`, "PUT", { role: desiredRole });
                  await loadUsersAdmin();
                } catch {}
              }
              setTab(TAB.CREATE_APPT);
            }}
          />
        </section>
      )}

      {/* Heute */}
      <section className="admin-card">
        <h3>Buchungen für heute</h3>
        <ul className="list">
          {(todayBookings || []).map((b) => (
            <li key={b.id} className="list-row">
              <div>
                <strong>{moment(b.appointmentTime).format("DD.MM.YYYY HH:mm")}</strong>{" "}
                – {b.categoryName || "Kategorie"} – {b.userName || b.userId}
              </div>
              <div className="row-actions">
                <button className="btn btn--danger" onClick={() => cancelBookingAdmin(b.id)}>
                  Stornieren
                </button>
              </div>
            </li>
          ))}
          {(!todayBookings || todayBookings.length === 0) && <li>Keine Buchungen heute.</li>}
        </ul>
      </section>

      {/* Nicht bestätigte */}
      <section className="admin-card">
        <h3>Nicht bestätigte Buchungen</h3>
        <ul className="list">
          {(unconfirmed || []).map((b) => (
            <li key={b.id} className="list-row">
              <div>
                <strong>{moment(b.appointmentTime).format("DD.MM.YYYY HH:mm")}</strong>{" "}
                – {b.categoryName || "Kategorie"} – {b.userName || b.userId}
              </div>
              <div className="row-actions">
                <button className="btn btn--success" onClick={() => confirmBooking(b.id)}>
                  Bestätigen
                </button>
                <button className="btn btn--danger" onClick={() => rejectBooking(b.id)}>
                  Ablehnen
                </button>
              </div>
            </li>
          ))}
          {(!unconfirmed || unconfirmed.length === 0) && <li>Keine offenen Anfragen.</li>}
        </ul>
      </section>

      {/* Kategorien */}
      <section className="admin-card">
        <h3 style={{ display: "flex", gap: 8 }}>
          <button className="btn btn--primary" onClick={() => setCatFormOpen((v) => !v)}>
            + Kategorie erstellen
          </button>
          <button className="btn btn--light" onClick={() => setCatListOpen((v) => !v)}>
            Kategorien verwalten
          </button>
        </h3>

        {catFormOpen && (
          <form className="grid grid--2" onSubmit={saveCategory}>
            <input type="hidden" value={catForm.id} readOnly />
            <label>
              <span className="label">Name</span>
              <input
                className="input"
                value={catForm.name}
                onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                required
              />
            </label>
            <label>
              <span className="label">Dauer (Min)</span>
              <input
                type="number"
                className="input"
                value={catForm.durationMinutes}
                onChange={(e) => setCatForm({ ...catForm, durationMinutes: e.target.value })}
                required
              />
            </label>
            <label className="grid--full">
              <span className="label">Beschreibung</span>
              <input
                className="input"
                value={catForm.description}
                onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                required
              />
            </label>
            <div className="grid--full" style={{ textAlign: "right" }}>
              <button className="btn btn--primary" type="submit">
                {catForm.id ? "Aktualisieren" : "Erstellen"}
              </button>
            </div>
          </form>
        )}

        {catListOpen && (
          <ul className="list">
            {(categories || []).map((c) => (
              <li key={c.id} className="list-row">
                <div>
                  {c.name} <span className="muted">({c.durationMinutes} Min)</span> – {c.description}
                </div>
                <div className="row-actions">
                  <button className="btn btn--light" onClick={() => editCategory(c)}>
                    Bearbeiten
                  </button>
                  <button className="btn btn--danger" onClick={() => deleteCategory(c.id)}>
                    Löschen
                  </button>
                </div>
              </li>
            ))}
            {(!categories || categories.length === 0) && <li>Keine Kategorien vorhanden.</li>}
          </ul>
        )}
      </section>

      {/* Benutzerverwaltung (Suche + Paging + Rollen + Löschen) */}
      <UserAdminBlock allUsers={allUsers} reloadUsers={loadUsersAdmin} />

      {/* Arbeitstag sperren/freigeben */}
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

      {/* Öffnungszeiten */}
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

      {/* Alle zukünftigen Buchungen */}
      <section className="admin-card">
        <h3>Alle zukünftigen Buchungen</h3>

        <div className="toolbar">
          <input
            className="input"
            placeholder="Nach Benutzer oder Kategorie suchen…"
            value={bookingSearch}
            onChange={(e) => {
              setBookingSearch(e.target.value);
              setBookingsPage(0);
            }}
            style={{ maxWidth: 360 }}
          />
        </div>

        <ul className="list">
          {bookingsSlice.map((b) => (
            <li key={b.id} className="list-row">
              <div>
                <strong>{moment(b.appointmentTime).format("DD.MM.YYYY HH:mm")}</strong>{" "}
                – {b.categoryName || "Kategorie"} – {b.userName || b.userId}
              </div>
              <div className="row-actions">
                <button className="btn btn--danger" onClick={() => cancelBookingAdmin(b.id)}>
                  Stornieren
                </button>
              </div>
            </li>
          ))}
          {bookingsSlice.length === 0 && <li>Keine Treffer.</li>}
        </ul>

        <div className="pager">
          <button
            className="btn btn--light"
            disabled={bookingsPage === 0}
            onClick={() => setBookingsPage((p) => p - 1)}
          >
            ← Zurück
          </button>
          <button
            className="btn btn--light"
            disabled={(bookingsPage + 1) * bookingsPerPage >= filteredBookings.length}
            onClick={() => setBookingsPage((p) => p + 1)}
          >
            Weiter →
          </button>
        </div>
      </section>

      {/* Logout */}
      <div style={{ textAlign: "right", margin: "12px 0 40px" }}>
        <button className="btn btn--danger" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}

/* ───────────────── Sub-Komponente: Benutzerverwaltung ───────────────── */
function UserAdminBlock({ allUsers, reloadUsers }) {
  const [userSearch, setUserSearch] = useState("");
  const [usersPage, setUsersPage] = useState(0);
  const usersPerPage = 5;

  const filteredUsers = useMemo(() => {
    const q = userSearch.toLowerCase().trim();
    if (!q) return allUsers || [];
    return (allUsers || []).filter(
      (u) =>
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q)
    );
  }, [allUsers, userSearch]);

  const usersSlice = useMemo(() => {
    const start = usersPage * usersPerPage;
    return filteredUsers.slice(start, start + usersPerPage);
  }, [filteredUsers, usersPage]);

  async function changeUserRole(userId, role) {
    try {
      await fetchWithAuth(`/admin/users/${userId}/role`, "PUT", { role });
      await (reloadUsers?.());
    } catch (e) {
      alert("Rolle konnte nicht geändert werden.");
      console.error(e);
    }
  }

  async function deleteUser(userId) {
    if (!window.confirm("Benutzer wirklich löschen?")) return;
    try {
      await fetchWithAuth(`/admin/users/${userId}`, "DELETE");
      await (reloadUsers?.());
    } catch (e) {
      alert("Benutzer konnte nicht gelöscht werden.");
      console.error(e);
    }
  }

  return (
    <section className="admin-card">
      <h3>Benutzerverwaltung</h3>

      <div className="toolbar">
        <input
          className="input"
          placeholder="Benutzer suchen…"
          value={userSearch}
          onChange={(e) => {
            setUserSearch(e.target.value);
            setUsersPage(0);
          }}
          style={{ maxWidth: 320 }}
        />
      </div>

      <ul className="list">
        {usersSlice.map((u) => (
          <li key={u.id} className="list-row">
            <div>
              {u.name}{" "}
              <span className="badge" style={{ marginLeft: 8 }}>
                {u.role}
              </span>
              <div className="muted" style={{ fontSize: 12 }}>
                {u.email || u.username}
              </div>
            </div>
            <div className="row-actions">
              {u.role !== "ADMIN" && (
                <button
                  className="btn btn--primary"
                  onClick={() => changeUserRole(u.id, "ADMIN")}
                >
                  zu ADMIN
                </button>
              )}
              {u.role !== "USER" && (
                <button
                  className="btn btn--primary"
                  onClick={() => changeUserRole(u.id, "USER")}
                >
                  zu USER
                </button>
              )}
              <button
                className="btn btn--danger"
                onClick={() => deleteUser(u.id)}
              >
                Löschen
              </button>
            </div>
          </li>
        ))}
        {usersSlice.length === 0 && <li>Keine Treffer.</li>}
      </ul>

      <div className="pager">
        <button
          className="btn btn--light"
          disabled={usersPage === 0}
          onClick={() => setUsersPage((p) => p - 1)}
        >
          ← Zurück
        </button>
        <button
          className="btn btn--light"
          disabled={(usersPage + 1) * usersPerPage >= filteredUsers.length}
          onClick={() => setUsersPage((p) => p + 1)}
        >
          Weiter →
        </button>
      </div>
    </section>
  );
}
