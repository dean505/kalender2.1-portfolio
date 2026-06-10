package com.example.kalender.controller;

import com.example.kalender.dto.BookedSlotDTO;
import com.example.kalender.dto.BookingDTO;
import com.example.kalender.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Für alle Benutzer – Eigene Buchungen erstellen und abrufen
@RestController
@RequestMapping("/api/bookings")
public class BookingUserController {

    private final BookingService bookingService;

    public BookingUserController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // Erstellt eine neue Buchung für den aktuell eingeloggten Benutzer
    // BookingUserController.java
    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody BookingDTO dto) {
        BookingDTO created = bookingService.createBooking(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // Gibt alle Buchungen des aktuell eingeloggten Benutzers zurück
    @GetMapping("/me")
    public List<BookingDTO> getMyBookings() {
        return bookingService.getMyBookings();
    }

    @GetMapping("/alle-zeiten")
    public List<BookedSlotDTO> getAllAppointmentTimes(@RequestParam(required = false) Long masterId) {
        return bookingService.getAllAppointmentTimes(masterId);
    }
}
