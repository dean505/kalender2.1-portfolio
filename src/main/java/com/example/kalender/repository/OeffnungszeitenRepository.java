package com.example.kalender.repository;

import com.example.kalender.entity.Oeffnungszeiten;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.DayOfWeek;
import java.util.Optional;

public interface OeffnungszeitenRepository extends JpaRepository<Oeffnungszeiten, Long> {
    // Findet Öffnungszeiten für einen bestimmten Wochentag
    Optional<Oeffnungszeiten> findByWochentag(DayOfWeek wochentag);
}


