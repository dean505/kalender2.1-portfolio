package com.example.kalender.controller;

import com.example.kalender.entity.Arbeitstag;
import com.example.kalender.repository.ArbeitstagRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

// Für alle Benutzer – Arbeitstagstatus abrufen
@RestController
@RequestMapping("/api/arbeitstag")
public class ArbeitstagUserController {

    private final ArbeitstagRepository arbeitstagRepository;

    public ArbeitstagUserController(ArbeitstagRepository arbeitstagRepository) {
        this.arbeitstagRepository = arbeitstagRepository;
    }

    // Gibt den Arbeitstag für ein bestimmtes Datum zurück
    @GetMapping("/datum/{date}")
    public ResponseEntity<Arbeitstag> getArbeitstagByDatum(@PathVariable LocalDate date) {
        return arbeitstagRepository.findByDatum(date)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}



