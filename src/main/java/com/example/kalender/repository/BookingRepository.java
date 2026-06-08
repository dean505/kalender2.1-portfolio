package com.example.kalender.repository;

import com.example.kalender.entity.Booking;
import com.example.kalender.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    boolean existsByUserId(Long userId);

    List<Booking> findByUserId(Long userId);

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByStatusAndAppointmentTimeBetween(
            BookingStatus status,
            LocalDateTime start,
            LocalDateTime end
    );

    @Query("""
           SELECT b
           FROM Booking b
           WHERE b.appointmentTime >= :dayStart
             AND b.appointmentTime < :dayEnd
           ORDER BY b.appointmentTime ASC
           """)
    List<Booking> findAllInDay(LocalDateTime dayStart, LocalDateTime dayEnd);
}


