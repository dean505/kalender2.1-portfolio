package com.example.kalender.dto;

// DTO für Login-Daten (E-Mail und Passwort)
public record LoginDTO(
        String email, // Die E-Mail-Adresse des Benutzers
        String password // Das Passwort des Benutzers
) {}


