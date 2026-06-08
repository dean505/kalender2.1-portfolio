package com.example.kalender.dto;

// DTO für Kategorien
public record CategoryDTO(
        Long id, // Die ID der Kategorie
        String name, // Der Name der Kategorie
        String description, // Beschreibung der Kategorie
        long durationMinutes // Die Dauer der Kategorie in Minuten
) {}
