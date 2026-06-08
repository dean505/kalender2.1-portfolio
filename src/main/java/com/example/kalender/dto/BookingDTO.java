package com.example.kalender.dto;

import java.time.LocalDateTime;

// DTO für Buchungsdaten
public record BookingDTO(
        Long id, // Die ID der Buchung
        LocalDateTime appointmentTime, // Die Uhrzeit der Buchung
        Long userId, // Die ID des Benutzers, der die Buchung gemacht hat
        Long categoryId, // Die ID der Kategorie der Buchung
        String categoryName, // Der Name der Kategorie
        String userName // Der Name des Benutzers
) {}


