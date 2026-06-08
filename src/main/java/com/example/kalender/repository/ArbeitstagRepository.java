package com.example.kalender.repository;

import com.example.kalender.entity.Arbeitstag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Optional;

public interface ArbeitstagRepository extends JpaRepository<Arbeitstag, Long> {
    // Sucht nach einem Arbeitstag anhand des Wochentags
    Optional<Arbeitstag> findByWochentag(DayOfWeek wochentag);  // Überprüft, ob der Wochentag gesperrt ist

    // Prüft, ob ein Arbeitstag für den angegebenen Wochentag existiert
    boolean existsByWochentag(DayOfWeek wochentag); // Überprüfung, ob ein Arbeitstag für den angegebenen Wochentag existiert

    // Sucht nach einem Arbeitstag anhand des Datums
    Optional<Arbeitstag> findByDatum(LocalDate datum); // Sucht den Arbeitstag für das angegebene Datum
}

