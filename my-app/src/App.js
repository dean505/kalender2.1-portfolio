import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import UserPage from './pages/UserPage';

const App = () => (
    <Router>
        <Routes>
            <Route path="/" element={<Navigate to="/login" />} />  {/* ✅ Weiterleitung */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/user" element={<UserPage />} />
        </Routes>
    </Router>
);

export default App;


