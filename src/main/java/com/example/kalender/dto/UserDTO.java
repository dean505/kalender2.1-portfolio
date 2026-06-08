package com.example.kalender.dto;

// DTO für Benutzerdaten (ID, Name, E-Mail, Telefonnummer und Rolle)
public record UserDTO(
        Long id, // Die ID des Benutzers
        String name, // Der Name des Benutzers
        String email, // Die E-Mail-Adresse des Benutzers
        String telefonnummer, // Die Telefonnummer des Benutzers
        String role // Die Rolle des Benutzers
) {}


