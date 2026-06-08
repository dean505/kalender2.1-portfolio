package com.example.kalender.controller;

import com.example.kalender.entity.Oeffnungszeiten;
import com.example.kalender.service.OeffnungszeitenService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDate;

// Nur für ADMINs – Öffnungszeiten verwalten
@RestController
@RequestMapping("/admin/oeffnungszeiten")
public class OeffnungszeitenAdminController {

    private final OeffnungszeitenService service;

    public OeffnungszeitenAdminController(OeffnungszeitenService service) {
        this.service = service;
    }

    // Gibt die Öffnungszeiten für ein bestimmtes Datum zurück
    @GetMapping("/datum/{date}")
    public ResponseEntity<Oeffnungszeiten> getOeffnungszeitenByDate(@PathVariable LocalDate date) {
        DayOfWeek dayOfWeek  = date.getDayOfWeek();
        Oeffnungszeiten oeffnungszeiten = service.getOeffnungszeiten(dayOfWeek);
        return oeffnungszeiten != null
                ? ResponseEntity.ok(oeffnungszeiten)
                : ResponseEntity.notFound().build();
    }

    // Aktualisiert die Öffnungszeiten für ein bestimmtes Datum
    @PutMapping("/datum/{date}")
    public ResponseEntity<Oeffnungszeiten> updateOeffnungszeiten(@PathVariable LocalDate date, @RequestBody Oeffnungszeiten oeffnungszeiten) {
        DayOfWeek dayOfWeek  = date.getDayOfWeek();
        Oeffnungszeiten existing = service.getOeffnungszeiten(dayOfWeek);
        if (existing != null) {
            existing.setStartUhrzeit(oeffnungszeiten.getStartUhrzeit());
            existing.setEndUhrzeit(oeffnungszeiten.getEndUhrzeit());
            service.saveOeffnungszeiten(existing);
            return ResponseEntity.ok(existing);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
    }

    // Erstellt neue Öffnungszeiten
    @PostMapping
    public ResponseEntity<Oeffnungszeiten> create(@RequestBody Oeffnungszeiten oeffnungszeiten) {
        Oeffnungszeiten saved = service.saveOeffnungszeiten(oeffnungszeiten);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}


