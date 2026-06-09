import React, { useMemo, useState } from "react";
import { deleteUser as deleteUserRequest, updateUserRole } from "../services/adminService";

export default function UserAdminBlock({ allUsers, reloadUsers }) {
  const [userSearch, setUserSearch] = useState("");
  const [usersPage, setUsersPage] = useState(0);
  const usersPerPage = 5;

  const filteredUsers = useMemo(() => {
    const query = userSearch.toLowerCase().trim();
    if (!query) return allUsers || [];
    return (allUsers || []).filter(
      (user) =>
        (user.name || "").toLowerCase().includes(query) ||
        (user.email || "").toLowerCase().includes(query)
    );
  }, [allUsers, userSearch]);

  const usersSlice = useMemo(() => {
    const start = usersPage * usersPerPage;
    return filteredUsers.slice(start, start + usersPerPage);
  }, [filteredUsers, usersPage]);

  async function changeUserRole(userId, role) {
    try {
      await updateUserRole(userId, role);
      await reloadUsers?.();
    } catch (e) {
      alert("Rolle konnte nicht geändert werden.");
      console.error(e);
    }
  }

  async function deleteUser(userId) {
    if (!window.confirm("Benutzer wirklich löschen?")) return;
    try {
      await deleteUserRequest(userId);
      await reloadUsers?.();
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
          placeholder="Benutzer suchen..."
          value={userSearch}
          onChange={(e) => {
            setUserSearch(e.target.value);
            setUsersPage(0);
          }}
          style={{ maxWidth: 320 }}
        />
      </div>

      <ul className="list">
        {usersSlice.map((user) => (
          <li key={user.id} className="list-row">
            <div>
              {user.name}{" "}
              <span className="badge" style={{ marginLeft: 8 }}>
                {user.role}
              </span>
              <div className="muted" style={{ fontSize: 12 }}>
                {user.email || user.username}
              </div>
            </div>
            <div className="row-actions">
              {user.role !== "ADMIN" && (
                <button
                  className="btn btn--primary"
                  onClick={() => changeUserRole(user.id, "ADMIN")}
                >
                  zu ADMIN
                </button>
              )}
              {user.role !== "USER" && (
                <button
                  className="btn btn--primary"
                  onClick={() => changeUserRole(user.id, "USER")}
                >
                  zu USER
                </button>
              )}
              <button
                className="btn btn--danger"
                onClick={() => deleteUser(user.id)}
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
          onClick={() => setUsersPage((page) => page - 1)}
        >
          Zurück
        </button>
        <button
          className="btn btn--light"
          disabled={(usersPage + 1) * usersPerPage >= filteredUsers.length}
          onClick={() => setUsersPage((page) => page + 1)}
        >
          Weiter
        </button>
      </div>
    </section>
  );
}
