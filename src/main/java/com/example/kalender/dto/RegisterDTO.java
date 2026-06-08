package com.example.kalender.dto;

// DTO für Registrierungsdaten (Name, Passwort, E-Mail und Telefonnummer)
public record RegisterDTO(
        String name, // Der Name des Benutzers
        String password, // Das Passwort des Benutzers
        String email, // Die E-Mail-Adresse des Benutzers
        String telefonnummer // Die Telefonnummer des Benutzers
) {}


