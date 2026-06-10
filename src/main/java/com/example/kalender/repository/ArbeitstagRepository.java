package com.example.kalender.repository;

import com.example.kalender.entity.Arbeitstag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ArbeitstagRepository extends JpaRepository<Arbeitstag, Long> {

    Optional<Arbeitstag> findByWochentag(DayOfWeek wochentag);

    boolean existsByWochentag(DayOfWeek wochentag);

    Optional<Arbeitstag> findByDatum(LocalDate datum);

    Optional<Arbeitstag> findFirstByMasterIdAndDatum(Long masterId, LocalDate datum);

    Optional<Arbeitstag> findFirstByMasterIdAndWochentag(Long masterId, DayOfWeek wochentag);

    boolean existsByMasterIdAndWochentag(Long masterId, DayOfWeek wochentag);

    List<Arbeitstag> findByMasterIsNull();
}
