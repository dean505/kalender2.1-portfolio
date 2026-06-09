package com.example.kalender.repository;

import com.example.kalender.entity.Booking;
import com.example.kalender.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    List<Booking> findByMasterIsNull();

    @Query("""
           SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END
           FROM Booking b
           WHERE b.user.id = :userId
             AND b.appointmentTime < :end
             AND b.appointmentTime >= :start
           """)
    boolean hasBookingConflict(
            @Param("userId") Long userId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query("""
           SELECT b
           FROM Booking b
           WHERE b.appointmentTime >= :dayStart
             AND b.appointmentTime < :dayEnd
           """)
    List<Booking> findAllBetween(
            @Param("dayStart") LocalDateTime dayStart,
            @Param("dayEnd") LocalDateTime dayEnd
    );

    default List<Booking> findAllByDate(java.time.LocalDate date) {
        return findAllBetween(date.atStartOfDay(), date.plusDays(1).atStartOfDay());
    }

    @Query("""
           SELECT b
           FROM Booking b
           WHERE b.master.id = :masterId
             AND b.appointmentTime >= :dayStart
             AND b.appointmentTime < :dayEnd
           """)
    List<Booking> findAllByMasterBetween(
            @Param("masterId") Long masterId,
            @Param("dayStart") LocalDateTime dayStart,
            @Param("dayEnd") LocalDateTime dayEnd
    );

    default List<Booking> findAllByMasterAndDate(Long masterId, java.time.LocalDate date) {
        return findAllByMasterBetween(masterId, date.atStartOfDay(), date.plusDays(1).atStartOfDay());
    }

    @Query("""
           SELECT b
           FROM Booking b
           WHERE b.appointmentTime >= :dayStart
             AND b.appointmentTime < :dayEnd
           ORDER BY b.appointmentTime ASC
           """)
    List<Booking> findAllInDay(LocalDateTime dayStart, LocalDateTime dayEnd);
}
