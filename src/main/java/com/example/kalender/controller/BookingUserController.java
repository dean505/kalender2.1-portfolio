package com.example.kalender.controller;

import com.example.kalender.dto.BookedSlotDTO;
import com.example.kalender.dto.BookingDTO;
import com.example.kalender.service.BookingService;
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
    public ResponseEntity<?> create(@RequestBody BookingDTO dto) {
        try {
            BookingDTO created = bookingService.createBooking(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    // Gibt alle Buchungen des aktuell eingeloggten Benutzers zurück
    @GetMapping("/me")
    public List<BookingDTO> getMyBookings() {
        return bookingService.getMyBookings();
    }

    @GetMapping("/alle-zeiten")
    public List<BookedSlotDTO> getAllAppointmentTimes() {
        return bookingService.getAllAppointmentTimes();
    }
}

