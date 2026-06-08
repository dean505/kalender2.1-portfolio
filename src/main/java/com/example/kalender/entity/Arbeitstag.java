package com.example.kalender.entity;

import jakarta.persistence.*;

import java.time.DayOfWeek;
import java.time.LocalDate;

@Entity
public class Arbeitstag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Die ID des Arbeitstags

    @Enumerated(EnumType.STRING)
    private DayOfWeek wochentag; // Der Wochentag des Arbeitstags

    private boolean istGesperrt; // Gibt an, ob der Arbeitstag gesperrt ist

    private LocalDate datum;  // Das Datum des Arbeitstags (neues Feld)

    // Konstruktoren, Getter und Setter
    public Arbeitstag() {}


    // Konstruktor mit allen Attributen
    public Arbeitstag(DayOfWeek wochentag, boolean istGesperrt, LocalDate datum) {
        this.wochentag = wochentag;
        this.istGesperrt = istGesperrt;
        this.datum = datum;
    }

    // Konstruktor ohne Datum
    public Arbeitstag(DayOfWeek wochentag, boolean istGesperrt) {
        this.wochentag = wochentag;
        this.istGesperrt = istGesperrt;
    }

    public DayOfWeek getWochentag() {
        return wochentag; // Gibt den Wochentag zurück
    }

    public void setWochentag(DayOfWeek wochentag) {
        this.wochentag = wochentag; // Setzt den Wochentag
    }

    public boolean isIstGesperrt() {
        return istGesperrt; // Gibt zurück, ob der Arbeitstag gesperrt ist
    }

    public void setIstGesperrt(boolean istGesperrt) {
        this.istGesperrt = istGesperrt; // Setzt den Sperrstatus des Arbeitstags
    }

    public LocalDate getDatum() {
        return datum; // Gibt das Datum des Arbeitstags zurück
    }

    public void setDatum(LocalDate datum) {
        this.datum = datum; // Setzt das Datum des Arbeitstags
    }
}




