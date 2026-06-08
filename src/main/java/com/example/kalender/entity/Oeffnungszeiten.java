package com.example.kalender.entity;

import jakarta.persistence.*;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Entity
public class Oeffnungszeiten {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Die ID der Öffnungszeiten

    @Enumerated(EnumType.STRING)
    private DayOfWeek wochentag;  // Der Tag der Woche (z.B. Montag, Dienstag)

    private LocalTime startUhrzeit;  // Startzeit der Öffnung
    private LocalTime endUhrzeit;    // Endzeit der Öffnung

    // Konstruktoren, Getter und Setter
    public Oeffnungszeiten() {}

    // Konstruktor mit Wochentag, Startzeit und Endzeit
    public Oeffnungszeiten(DayOfWeek wochentag, LocalTime startUhrzeit, LocalTime endUhrzeit) {
        this.wochentag = wochentag;
        this.startUhrzeit = startUhrzeit;
        this.endUhrzeit = endUhrzeit;
    }

    // Getter und Setter
    public DayOfWeek getWochentag() {
        return wochentag; // Gibt den Wochentag zurück
    }

    public void setWochentag(DayOfWeek wochentag) {
        this.wochentag = wochentag; // Setzt den Wochentag
    }

    public LocalTime getStartUhrzeit() {
        return startUhrzeit; // Gibt die Startzeit der Öffnung zurück
    }

    public void setStartUhrzeit(LocalTime startUhrzeit) {
        this.startUhrzeit = startUhrzeit; // Setzt die Startzeit der Öffnung
    }

    public LocalTime getEndUhrzeit() {
        return endUhrzeit; // Gibt die Endzeit der Öffnung zurück
    }

    public void setEndUhrzeit(LocalTime endUhrzeit) {
        this.endUhrzeit = endUhrzeit; // Setzt die Endzeit der Öffnung
    }
}


