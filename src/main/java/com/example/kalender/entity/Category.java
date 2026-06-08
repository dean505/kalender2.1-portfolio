package com.example.kalender.entity;

import jakarta.persistence.*;

@Entity
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Die ID der Kategorie

    private String name; // Der Name der Kategorie
    private String description; // Eine Beschreibung der Kategorie

    private long durationMinutes;  // Die Dauer der Buchung in Minuten

    // Konstruktoren, Getter und Setter
    public Category() {}

    public Long getId() {
        return id; // Gibt die ID der Kategorie zurück
    }

    public void setId(Long id) {
        this.id = id; // Setzt die ID der Kategorie
    }

    public String getName() {
        return name; // Gibt den Namen der Kategorie zurück
    }

    public void setName(String name) {
        this.name = name; // Setzt den Namen der Kategorie
    }

    public String getDescription() {
        return description; // Gibt die Beschreibung der Kategorie zurück
    }

    public void setDescription(String description) {
        this.description = description; // Setzt die Beschreibung der Kategorie
    }

    public long getDurationMinutes() {
        return durationMinutes; // Gibt die Dauer der Buchung in Minuten zurück
    }

    public void setDurationMinutes(long durationMinutes) {
        this.durationMinutes = durationMinutes; // Setzt die Dauer der Buchung in Minuten
    }
}

