import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import "../assets/style.css";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [telefonnummer, setTelefonnummer] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = { name, email, password, telefonnummer };

    try {
      await registerUser(payload);
      alert("Erfolgreich registriert! Du kannst dich jetzt einloggen.");
      navigate("/login");
    } catch (err) {
      console.error("Fehler bei der Registrierung:", err);
      setErrorMessage(
        err?.status === 409
          ? "E-Mail ist bereits vergeben."
          : `Registrierung fehlgeschlagen. ${err?.message || ""}`
      );
    }
  };

  return (
    <div className="page-wrap">
      <div className="auth-card">
        <h2>Registrieren</h2>
        <form onSubmit={handleSubmit}>
          <label className="label">Name</label>
          <input className="input" type="text" value={name} onChange={e => setName(e.target.value)} required />

          <label className="label">E-Mail</label>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />

          <label className="label">Telefonnummer</label>
          <input className="input" type="tel" value={telefonnummer} onChange={e => setTelefonnummer(e.target.value)} required />

          <label className="label">Passwort</label>
          <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />

          <div className="auth-actions">
            <button className="btn btn--primary" type="submit">Registrieren</button>
            <a href="/login">Schon ein Konto? Anmelden</a>
          </div>
        </form>

        {errorMessage && <p className="muted" style={{ color: "var(--danger)" }}>{errorMessage}</p>}
      </div>
    </div>
  );
};

export default RegisterPage;
