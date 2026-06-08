package com.example.kalender.controller;

import com.example.kalender.entity.Arbeitstag;
import com.example.kalender.service.ArbeitstagService;
import com.example.kalender.repository.ArbeitstagRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Optional;

// Nur für ADMINs – Verwaltung der Arbeitstage
@RestController
@RequestMapping("/admin/arbeitstag")
public class ArbeitstagAdminController {

    private final ArbeitstagService arbeitstagService;
    private final ArbeitstagRepository arbeitstagRepository;

    public ArbeitstagAdminController(ArbeitstagService arbeitstagService, ArbeitstagRepository arbeitstagRepository) {
        this.arbeitstagService = arbeitstagService;
        this.arbeitstagRepository = arbeitstagRepository;
    }

    // Gibt den Arbeitstag zu einem bestimmten Datum zurück
    @GetMapping("/datum/{date}")
    public ResponseEntity<Arbeitstag> getArbeitstagByDatum(@PathVariable LocalDate date) {
        return arbeitstagRepository.findByDatum(date)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Erstellt einen neuen Arbeitstag (sofern Wochentag noch nicht vorhanden)
    @PostMapping
    public ResponseEntity<Arbeitstag> createArbeitstag(@RequestBody Arbeitstag arbeitstag) {
        if (arbeitstagRepository.existsByWochentag(arbeitstag.getWochentag())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
        }
        Arbeitstag saved = arbeitstagRepository.save(arbeitstag);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // Aktualisiert den Sperrstatus eines Arbeitstags anhand des Datums
    @PutMapping("/datum/{date}")
    public ResponseEntity<Arbeitstag> updateArbeitstag(@PathVariable LocalDate date, @RequestBody Arbeitstag arbeitstag) {
        Optional<Arbeitstag> existing = arbeitstagRepository.findByDatum(date);
        if (existing.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        existing.get().setIstGesperrt(arbeitstag.isIstGesperrt());
        arbeitstagRepository.save(existing.get());
        return ResponseEntity.ok(existing.get());
    }

    // Gibt einen zuvor gesperrten Feiertag wieder frei
    @PutMapping("/datum/{date}/freigeben")
    public ResponseEntity<Arbeitstag> gibFeiertagFrei(@PathVariable LocalDate date) {
        DayOfWeek wochentag = date.getDayOfWeek();
        Arbeitstag arbeitstag = arbeitstagService.setArbeitstagStatus(wochentag, false); // false = freigeben
        return ResponseEntity.ok(arbeitstag);
    }

    // Sperrt einen Arbeitstag anhand des Datums
    @PutMapping("/datum/{date}/sperren")
    public ResponseEntity<Arbeitstag> sperreArbeitstag(@PathVariable LocalDate date) {
        Optional<Arbeitstag> existing = arbeitstagRepository.findByDatum(date);
        if (existing.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        existing.get().setIstGesperrt(true);
        arbeitstagRepository.save(existing.get());
        return ResponseEntity.ok(existing.get());
    }
}




