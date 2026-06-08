package com.example.kalender.service;

import com.example.kalender.entity.Arbeitstag;
import com.example.kalender.repository.ArbeitstagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Optional;

@Service
public class ArbeitstagService {

    @Autowired
    private ArbeitstagRepository arbeitstagRepository;

    // Setzt den Status eines Arbeitstags (gesperrt oder freigegeben)
    public Arbeitstag setArbeitstagStatus(DayOfWeek wochentag, boolean istGesperrt) {
        Optional<Arbeitstag> existingArbeitstag = arbeitstagRepository.findByWochentag(wochentag);
        Arbeitstag arbeitstag;

        if (existingArbeitstag.isPresent()) {
            arbeitstag = existingArbeitstag.get();
            arbeitstag.setIstGesperrt(istGesperrt); // Aktualisiert den Status des bestehenden Arbeitstags
        } else {
            arbeitstag = new Arbeitstag(wochentag, istGesperrt);  // Erstelle neuen Arbeitstag, wenn keiner gefunden wird
        }

        return arbeitstagRepository.save(arbeitstag); // Speichert den Arbeitstag
    }

    // Überprüft, ob ein Arbeitstag gesperrt ist
    public boolean isArbeitstagGesperrt(DayOfWeek wochentag) {
        Optional<Arbeitstag> arbeitstag = arbeitstagRepository.findByWochentag(wochentag);
        return arbeitstag.map(Arbeitstag::isIstGesperrt).orElse(false); // Gibt false zurück, wenn Arbeitstag nicht gefunden
    }

    public Optional<Arbeitstag> getArbeitstagByDate(LocalDate date) {
        return arbeitstagRepository.findByDatum(date);
    }
}



