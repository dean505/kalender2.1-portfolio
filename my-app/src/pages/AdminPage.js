// src/pages/AdminPage.js
import React, { useCallback, useEffect, useMemo, useState } from "react";
import moment from "moment";
import "moment/locale/de";
import { useNavigate } from "react-router-dom";
import { useBookingSchedule } from "../hooks/useBookingSchedule";
import { useAuthGuard } from "../hooks/useAuthGuard";
import { listCategories } from "../services/categoryService";
import {
  cancelAdminBooking,
  confirmBooking as confirmBookingRequest,
  createAdminBooking as createAdminBookingRequest,
  listAdminBookings,
  listBookedSlots,
  listTodayBookings,
  listUnconfirmedBookings,
  rejectBooking as rejectBookingRequest,
} from "../services/bookingService";
import { listUsers, updateUserRole } from "../services/adminService";
import AdminCreateUser from "../components/AdminCreateUser";
import AdminCategoryManager from "../components/AdminCategoryManager";
import AdminMasterManager from "../components/AdminMasterManager";
import ChangePasswordModal from "../components/ChangePasswordModal";
import SchedulePicker from "../components/SchedulePicker";
import { clearToken } from "../services/sessionService";
import UserAdminBlock from "../components/UserAdminBlock";
import AdminWorkdaySettings from "../components/AdminWorkdaySettings";
import { listMasters } from "../services/masterService";
import "../assets/style.css";

moment.locale("de");

// ✨ Tabs
const TAB = {
  CREATE_APPT: "CREATE_APPT",
  CREATE_USER: "CREATE_USER",
  MANAGE_USERS: "MANAGE_USERS",
  MANAGE_MASTERS: "MANAGE_MASTERS",
};
const ADMIN_ROLES = ["ROLE_ADMIN", "ROLE_SUPERADMIN"];
const withMasterQuery = (path, masterId) =>
  masterId ? `${path}?masterId=${encodeURIComponent(masterId)}` : path;

export default function AdminPage() {
  const navigate = useNavigate();
  const currentUser = useAuthGuard(ADMIN_ROLES);

  // ───────────────── Auth ─────────────────
  const [adminName, setAdminName] = useState("");
  const [pwdOpen, setPwdOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    setAdminName(currentUser.sub || currentUser.name || "");

    // Initial loads
    loadInitial();
    loadUnconfirmed();
    loadUsersAdmin();
    loadToday();
    loadAllBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  function logout() {
    clearToken();
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
  const [masters, setMasters] = useState([]);
  const [selectedMaster, setSelectedMaster] = useState(null);

  async function loadUsersAdmin() {
    const data = await listUsers().catch(() => []);
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

  const adminWorkdayPath = useCallback(
    (date) => withMasterQuery(`/admin/arbeitstag/datum/${date}`, selectedMaster?.id),
    [selectedMaster?.id]
  );

  const adminOpeningHoursPath = useCallback(
    (date) => withMasterQuery(`/admin/oeffnungszeiten/datum/${date}`, selectedMaster?.id),
    [selectedMaster?.id]
  );

  async function loadInitial() {
    const [loadedMasters, cats] = await Promise.all([
      listMasters(),
      listCategories(),
    ]);
    const nextMasters = loadedMasters || [];
    const nextMaster = selectedMaster || nextMasters[0] || null;
    const busy = nextMaster ? await listBookedSlots(nextMaster.id).catch(() => []) : [];

    setMasters(nextMasters);
    setSelectedMaster(nextMaster);
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
    workdayPath: adminWorkdayPath,
    openingHoursPath: adminOpeningHoursPath,
  });

  async function createAdminBooking() {
    if (!pickedUser?.id) { alert("Bitte zuerst einen Benutzer auswählen."); return; }
    if (!selectedCat?.id) { alert("Bitte eine Kategorie auswählen."); return; }
    if (!selectedDate || !selectedTime) { alert("Bitte Datum und Uhrzeit wählen."); return; }

    const appointmentTime = `${selectedDate}T${selectedTime}:00`;
    const payload = {
      userId: Number(pickedUser.id),
      categoryId: Number(selectedCat.id),
      masterId: Number(selectedMaster.id),
      appointmentTime
    };

    try {
      await createAdminBookingRequest(payload);
      alert("Termin wurde angelegt.");
      setSelectedTime("");
      await Promise.all([
        loadAllBookings(),
        loadToday(),
        loadUnconfirmed(),
        (async () => {
          const busy = await listBookedSlots(selectedMaster.id).catch(() => []);
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
    const todays = await listTodayBookings().catch(() => []);
    setTodayBookings(todays || []);
  }

  const [unconfirmed, setUnconfirmed] = useState([]);
  async function loadUnconfirmed() {
    const data = await listUnconfirmedBookings().catch(() => []);
    setUnconfirmed(data || []);
  }
  async function confirmBooking(id) {
    await confirmBookingRequest(id);
    loadUnconfirmed();
    loadToday();
  }
  async function rejectBooking(id) {
    await rejectBookingRequest(id);
    loadUnconfirmed();
    loadToday();
  }

  const [allBookings, setAllBookings] = useState([]);
  const [bookingsPage, setBookingsPage] = useState(0);
  const bookingsPerPage = 5;
  const [bookingSearch, setBookingSearch] = useState("");

  async function loadAllBookings() {
    let arr = await listAdminBookings().catch(() => []);
    const now = new Date();
    arr = (arr || []).filter((b) => new Date(b.appointmentTime) >= now);
    setAllBookings(arr);
  }

  const filteredBookings = useMemo(() => {
    const q = bookingSearch.toLowerCase();
    return (allBookings || []).filter(
      (b) =>
        (b.userName || "").toLowerCase().includes(q) ||
        (b.categoryName || "").toLowerCase().includes(q) ||
        (b.masterName || "").toLowerCase().includes(q)
    );
  }, [allBookings, bookingSearch]);

  const bookingsSlice = useMemo(() => {
    const start = bookingsPage * bookingsPerPage;
    return filteredBookings.slice(start, start + bookingsPerPage);
  }, [filteredBookings, bookingsPage]);

  async function cancelBookingAdmin(id) {
    if (!window.confirm("Termin stornieren?")) return;
    await cancelAdminBooking(id);
    loadAllBookings();
    loadToday();
  }

  async function reloadCategories() {
    const cats = await listCategories();
    setCategories(cats || []);
  }

  async function reloadMasters() {
    const data = await listMasters().catch(() => []);
    const nextMasters = data || [];
    setMasters(nextMasters);

    if (!selectedMaster || !nextMasters.some((master) => master.id === selectedMaster.id)) {
      setSelectedMaster(nextMasters[0] || null);
    }
  }

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

        <button
          type="button"
          role="tab"
          className={`tab ${tab === TAB.MANAGE_USERS ? "tab--active" : ""}`}
          onClick={() => setTab(TAB.MANAGE_USERS)}
          aria-selected={tab === TAB.MANAGE_USERS}
        >
          Benutzer verwalten
        </button>

        <button
          type="button"
          role="tab"
          className={`tab ${tab === TAB.MANAGE_MASTERS ? "tab--active" : ""}`}
          onClick={() => setTab(TAB.MANAGE_MASTERS)}
          aria-selected={tab === TAB.MANAGE_MASTERS}
        >
          Master verwalten
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
            <div className="grid--full">
              <label className="label">Master</label>
              <div className="pill-grid">
                {(masters || []).map((master) => (
                  <button
                    key={master.id}
                    type="button"
                    className={`pill ${selectedMaster?.id === master.id ? "pill--active" : ""}`}
                    onClick={async () => {
                      setSelectedMaster(master);
                      setSelectedTime("");
                      const busy = await listBookedSlots(master.id).catch(() => []);
                      setBusyTimes(busy || []);
                    }}
                  >
                    <div className="pill__title">{master.name}</div>
                    {master.description && <div className="pill__meta">{master.description}</div>}
                  </button>
                ))}
              </div>
            </div>

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
              <strong>Master:</strong> {selectedMaster?.name || "-"}
            </div>
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
              disabled={!selectedMaster || !pickedUser || !selectedCat || !selectedDate || !selectedTime}
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
                  await updateUserRole(created.id, desiredRole);
                  await loadUsersAdmin();
                } catch {}
              }
              setTab(TAB.CREATE_APPT);
            }}
          />
        </section>
      )}

      {tab === TAB.MANAGE_USERS && (
        <section className="admin-card">
          <div
            className="toolbar"
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            <h3 style={{ margin: 0 }}>Benutzer verwalten</h3>
          </div>

          <UserAdminBlock allUsers={allUsers} reloadUsers={loadUsersAdmin} />
        </section>
      )}

      {tab === TAB.MANAGE_MASTERS && (
        <>
          <AdminMasterManager onChanged={reloadMasters} />

          <AdminCategoryManager
            categories={categories}
            reloadCategories={reloadCategories}
          />

          <AdminWorkdaySettings
            masters={masters}
            currentMasterId={selectedMaster?.id}
            onWorkdayUpdated={(date, masterId) => {
              if (String(masterId) === String(selectedMaster?.id)) {
                refreshDisabledForWeek(date);
              }
            }}
            onOpeningHoursUpdated={(date, masterId) => {
              if (String(masterId) === String(selectedMaster?.id) && selectedDate === date) {
                setSelectedTime("");
              }
            }}
          />
        </>
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

      {/* Benutzerverwaltung (Suche + Paging + Rollen + Löschen) */}
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

      <ChangePasswordModal
        open={pwdOpen}
        onClose={() => setPwdOpen(false)}
        onSaved={() => setPwdOpen(false)}
      />

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

/* ───────────────── Sub-Komponente: Benutzerverwaltung ───────────────── */
