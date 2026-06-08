import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { parseJwt } from "../utils/jwt";
import { API_BASE } from "../utils/api";
import "../assets/style.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      const role = parseJwt(token).role;
      navigate(role === "ROLE_ADMIN" ? "/admin" : "/user");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password }),
    });

    const text = await response.text();
    let token;
    try { token = JSON.parse(text || "{}").token; } catch {}

    if (!response.ok) {
      setErrorMessage(`Login fehlgeschlagen (${response.status}). ${text || ""}`);
      return;
    }
    if (!token) {
      setErrorMessage("Login fehlgeschlagen: Server hat kein Token geliefert.");
      return;
    }

    localStorage.setItem("jwt", token);
    const role = parseJwt(token).role || "";
    navigate(role === "ROLE_ADMIN" ? "/admin" : "/user");
  };

  return (
    <div className="page-wrap">
      <div className="auth-card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <label className="label" htmlFor="email">E‑Mail</label>
          <input
            className="input"
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="label" htmlFor="password">Passwort</label>
          <input
            className="input"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="auth-actions">
            <button className="btn btn--primary" type="submit">Anmelden</button>
            <a href="/register">Jetzt registrieren</a>
          </div>
        </form>

        {errorMessage && <p className="muted" style={{ color: "var(--danger)" }}>{errorMessage}</p>}
      </div>
    </div>
  );
};

export default LoginPage;



