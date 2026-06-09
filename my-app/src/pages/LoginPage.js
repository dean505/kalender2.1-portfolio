import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { getCurrentUser, getRoleRedirect, setToken } from "../services/sessionService";
import "../assets/style.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    const currentUser = getCurrentUser();
    if (token && currentUser) {
      navigate(getRoleRedirect(currentUser.role));
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let token;
    try {
      token = await login({ email: email.trim(), password });
    } catch (err) {
      setErrorMessage(err?.message || "Login fehlgeschlagen.");
      return;
    }

    setToken(token);
    const currentUser = getCurrentUser();
    navigate(getRoleRedirect(currentUser?.role || ""));
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

