package com.example.kalender.entity;

// Enum für den Status einer Buchung
public enum BookingStatus {
    PENDING,    // Ausstehend (Buchung wurde erstellt, aber noch nicht bestätigt)
    CONFIRMED,  // Bestätigt (Buchung wurde bestätigt)
    REJECTED    // Abgelehnt (Buchung wurde abgelehnt)
}

