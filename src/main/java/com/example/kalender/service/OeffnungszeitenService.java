package com.example.kalender.service;

import com.example.kalender.entity.Oeffnungszeiten;
import com.example.kalender.repository.OeffnungszeitenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.util.Optional;

@Service
public class OeffnungszeitenService {

    @Autowired
    private OeffnungszeitenRepository oeffnungszeitenRepository;

    // Gibt die Öffnungszeiten für einen bestimmten Wochentag zurück
    public Oeffnungszeiten getOeffnungszeiten(DayOfWeek wochentag) {
        return oeffnungszeitenRepository.findByWochentag(wochentag).stream().findFirst().orElse(null);
    }

    // Aktualisiert die Öffnungszeiten für einen bestimmten Wochentag
    public Oeffnungszeiten updateOeffnungszeiten(DayOfWeek wochentag, Oeffnungszeiten newOeffnungszeiten) {
        Optional<Oeffnungszeiten> existingOeffnungszeiten = oeffnungszeitenRepository.findByWochentag(wochentag).stream().findFirst();

        if (existingOeffnungszeiten.isPresent()) {
            Oeffnungszeiten oeffnungszeiten = existingOeffnungszeiten.get();
            oeffnungszeiten.setStartUhrzeit(newOeffnungszeiten.getStartUhrzeit());
            oeffnungszeiten.setEndUhrzeit(newOeffnungszeiten.getEndUhrzeit());
            return oeffnungszeitenRepository.save(oeffnungszeiten); // Speichert die aktualisierten Öffnungszeiten
        } else {
            return null; // Falls keine Öffnungszeiten für den Wochentag existieren
        }
    }

    // Speichert neue Öffnungszeiten
    public Oeffnungszeiten saveOeffnungszeiten(Oeffnungszeiten oeffnungszeiten) {
        return oeffnungszeitenRepository.save(oeffnungszeiten); // Speichert die Öffnungszeiten
    }
}



