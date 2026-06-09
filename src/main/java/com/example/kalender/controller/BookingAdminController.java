package com.example.kalender.controller;

import com.example.kalender.dto.AdminBookingRequest;
import com.example.kalender.dto.BookingDTO;
import com.example.kalender.entity.Booking;
import com.example.kalender.entity.BookingStatus;
import com.example.kalender.repository.BookingRepository;
import com.example.kalender.service.BookingAdminService;
import com.example.kalender.service.BookingService;
import com.example.kalender.service.MailService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

// Nur für ADMINs – Buchungen verwalten
@RestController
@RequestMapping("/admin/bookings")
public class BookingAdminController {

    private final BookingRepository bookingRepository;
    private final BookingService bookingService;
    private final BookingAdminService bookingAdminService;
    private final MailService mailService;

    public BookingAdminController(BookingRepository bookingRepository, BookingService bookingService, BookingAdminService bookingAdminService, MailService mailService) {
        this.bookingRepository = bookingRepository;
        this.bookingService = bookingService;
        this.bookingAdminService = bookingAdminService;
        this.mailService = mailService;
    }

    @PostMapping
    public ResponseEntity<?> createForUser(@Valid @RequestBody AdminBookingRequest req) {
        var dto = bookingAdminService.createForUser(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    // Gibt alle Buchungen zurück (Admin-Übersicht)
    @GetMapping
    public List<BookingDTO> getAllBookings() {
        return bookingService.getAllBookings();
    }

    // Bestätigt eine Buchung anhand der ID
    @PutMapping("/{id}/confirm")
    public ResponseEntity<Booking> confirmBooking(@PathVariable Long id) {
        return bookingRepository.findById(id)
                .map(booking -> {
                    booking.setStatus(BookingStatus.CONFIRMED);
                    bookingRepository.save(booking);
                    mailService.sendBookingConfirmed(booking.getUser(), booking);
                    return ResponseEntity.ok(booking);
                }).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // Lehnt eine Buchung ab und löscht sie anschließend
    @PutMapping("/{id}/reject")
    public ResponseEntity<Void> rejectAndDeleteBooking(@PathVariable Long id) {
        Optional<Booking> booking = bookingRepository.findById(id);
        if (booking.isPresent()) {
            Booking b = booking.get();
            b.setStatus(BookingStatus.REJECTED);
            bookingRepository.save(b);
            // ✉️ Mail: abgelehnt
            mailService.sendBookingRejected(b.getUser(), b);
            bookingRepository.delete(b);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    // Gibt alle noch nicht bestätigten Buchungen zurück
    @GetMapping("/unconfirmed")
    public List<BookingDTO> getUnconfirmedBookings() {
        return bookingService.getUnconfirmedBookings();
    }

    // Gibt alle Buchungen des aktuellen Tages zurück
    @GetMapping("/today")
    public List<BookingDTO> getBookingsForToday() {
        return bookingService.getBookingsForToday();
    }

    @DeleteMapping("/{bookingId}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long bookingId) {
        bookingService.deleteById(bookingId); // oder storniere nur
        return ResponseEntity.noContent().build();
    }

}
