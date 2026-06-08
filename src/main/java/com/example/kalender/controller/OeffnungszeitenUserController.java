package com.example.kalender.controller;

import com.example.kalender.entity.Oeffnungszeiten;
import com.example.kalender.service.OeffnungszeitenService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDate;

// Für alle Benutzer – Öffnungszeiten anzeigen
@RestController
@RequestMapping("/api/oeffnungszeiten")
public class OeffnungszeitenUserController {

    private final OeffnungszeitenService service;

    public OeffnungszeitenUserController(OeffnungszeitenService service) {
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
}



