package com.example.kalender.entity;

import jakarta.persistence.*;

@Entity
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Die ID des Benutzers, die automatisch generiert wird

    private String name; // Der Name des Benutzers

    @Column(unique = true, nullable = false)
    private String email; // Die E-Mail-Adresse des Benutzers (eindeutig und nicht null)

    private String telefonnummer; // Die Telefonnummer des Benutzers

    private String password; // Das Passwort des Benutzers (verschlüsselt gespeichert)

    @Enumerated(EnumType.STRING)
    private Role role; // Die Rolle des Benutzers (ADMIN, USER, etc.)

    public AppUser() {}

    // Getter & Setter

    public Long getId() {
        return id; // Gibt die ID des Benutzers zurück
    }

    public void setId(Long id) {
        this.id = id; // Setzt die ID des Benutzers
    }

    public String getName() {
        return name; // Gibt den Namen des Benutzers zurück
    }

    public void setName(String name) {
        this.name = name; // Setzt den Namen des Benutzers
    }

    public String getEmail() {
        return email; // Gibt die E-Mail-Adresse des Benutzers zurück
    }

    public void setEmail(String email) {
        this.email = email; // Setzt die E-Mail-Adresse des Benutzers
    }

    public String getTelefonnummer() {
        return telefonnummer; // Gibt die Telefonnummer des Benutzers zurück
    }

    public void setTelefonnummer(String telefonnummer) {
        this.telefonnummer = telefonnummer; // Setzt die Telefonnummer des Benutzers
    }

    public String getPassword() {
        return password; // Gibt das Passwort des Benutzers zurück
    }

    public void setPassword(String password) {
        this.password = password; // Setzt das Passwort des Benutzers
    }

    public Role getRole() {
        return role; // Gibt die Rolle des Benutzers zurück
    }

    public void setRole(Role role) {
        this.role = role; // Setzt die Rolle des Benutzers
    }
}



