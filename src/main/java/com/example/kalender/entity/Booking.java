package com.example.kalender.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Die ID der Buchung

    private LocalDateTime appointmentTime; // Der Zeitpunkt der Buchung

    @ManyToOne
    private AppUser user; // Der Benutzer, der die Buchung erstellt hat

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category; // Die Kategorie der Buchung (z.B. Arzttermin, Meeting)

    @Enumerated(EnumType.STRING)
    private BookingStatus status;  // Der Status der Buchung (PENDING, CONFIRMED, REJECTED)

    public Booking() {
        this.status = BookingStatus.PENDING;  // Standardstatus beim Erstellen
    }

    // Getter und Setter

    public Long getId() {
        return id; // Gibt die ID der Buchung zurück
    }

    public void setId(Long id) {
        this.id = id; // Setzt die ID der Buchung
    }

    public LocalDateTime getAppointmentTime() {
        return appointmentTime; // Gibt den Zeitpunkt der Buchung zurück
    }

    public void setAppointmentTime(LocalDateTime appointmentTime) {
        this.appointmentTime = appointmentTime; // Setzt den Zeitpunkt der Buchung
    }

    public AppUser getUser() {
        return user; // Gibt den Benutzer zurück, der die Buchung erstellt hat
    }

    public void setUser(AppUser user) {
        this.user = user; // Setzt den Benutzer der Buchung
    }

    public Category getCategory() {
        return category; // Gibt die Kategorie der Buchung zurück
    }

    public void setCategory(Category category) {
        this.category = category; // Setzt die Kategorie der Buchung
    }

    public BookingStatus getStatus() {
        return status; // Gibt den Status der Buchung zurück
    }

    public void setStatus(BookingStatus status) {
        this.status = status; // Setzt den Status der Buchung
    }
}




