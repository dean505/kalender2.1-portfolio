package com.example.kalender.repository;

import com.example.kalender.entity.Oeffnungszeiten;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

public interface OeffnungszeitenRepository extends JpaRepository<Oeffnungszeiten, Long> {

    Optional<Oeffnungszeiten> findByWochentag(DayOfWeek wochentag);

    Optional<Oeffnungszeiten> findFirstByMasterIdAndWochentag(Long masterId, DayOfWeek wochentag);

    List<Oeffnungszeiten> findByMasterIsNull();
}
