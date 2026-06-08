package com.example.kalender.service;

import com.example.kalender.dto.BookingDTO;
import com.example.kalender.entity.*;
import com.example.kalender.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {
    private final BookingRepository bookingRepository;
    private final AppUserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ArbeitstagRepository arbeitstagRepository;
    private final OeffnungszeitenRepository oeffnungszeitenRepository;
    private final MailService mailService;


    public BookingService(BookingRepository bookingRepository, AppUserRepository userRepository, CategoryRepository categoryRepository, ArbeitstagRepository arbeitstagRepository,
                          OeffnungszeitenRepository oeffnungszeitenRepository, MailService mailService) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.arbeitstagRepository = arbeitstagRepository;
        this.oeffnungszeitenRepository = oeffnungszeitenRepository;
        this.mailService = mailService;
    }

    // Gibt alle Buchungen zurück
    public List<BookingDTO> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::mapToDTO)
                .toList();
    }

    // Erstellt eine neue Buchung
    // Erstellt eine neue Buchung und gibt das erstellte DTO zurück
    public BookingDTO createBooking(BookingDTO dto) {
        // 1. Aktuellen Benutzer ermitteln
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String login = auth.getName();
        AppUser user = userRepository.findByEmailIgnoreCase(login)
                .orElseThrow(() -> new IllegalStateException("Benutzer nicht gefunden"));

        // 2. Kategorie laden
        Category category = categoryRepository.findById(dto.categoryId())
                .orElseThrow(() -> new RuntimeException("Kategorie nicht gefunden"));

        LocalDate date = dto.appointmentTime().toLocalDate();
        LocalDateTime start = dto.appointmentTime();
        LocalDateTime end = start.plusMinutes(category.getDurationMinutes());

        // 3. Kollision beim Nutzer
        boolean conflict = bookingRepository.hasBookingConflict(user.getId(), start, end);
        if (conflict) {
            throw new IllegalStateException("Es besteht bereits eine Buchung im gewählten Zeitraum.");
        }

        // 4. Gesperrter Arbeitstag?
        Arbeitstag arbeitstag = arbeitstagRepository.findByDatum(date).orElse(null);
        if (arbeitstag != null && arbeitstag.isIstGesperrt()) {
            throw new IllegalStateException("Der gewählte Tag ist gesperrt.");
        }

        // 5. Öffnungszeiten?
        Oeffnungszeiten oeffnung = oeffnungszeitenRepository.findByWochentag(date.getDayOfWeek()).orElse(null);
        if (oeffnung == null || oeffnung.getStartUhrzeit() == null || oeffnung.getEndUhrzeit() == null) {
            throw new IllegalStateException("Keine Öffnungszeiten vorhanden.");
        }
        if (start.toLocalTime().isBefore(oeffnung.getStartUhrzeit()) ||
                end.toLocalTime().isAfter(oeffnung.getEndUhrzeit())) {
            throw new IllegalStateException("Buchung außerhalb der Öffnungszeiten.");
        }

        // 6. Globale Kollision
        List<Booking> allBookings = bookingRepository.findAllByDate(date);
        boolean hasConflict = allBookings.stream().anyMatch(existing -> {
            LocalDateTime existingStart = existing.getAppointmentTime();
            LocalDateTime existingEnd = existingStart.plusMinutes(existing.getCategory().getDurationMinutes());
            return existingStart.isBefore(end) && existingEnd.isAfter(start);
        });
        if (hasConflict) {
            throw new IllegalStateException("Zeitkollision mit einer bestehenden Buchung.");
        }

        // 7. Speichern
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setCategory(category);
        booking.setAppointmentTime(start);
        booking.setStatus(BookingStatus.PENDING);

        bookingRepository.save(booking);

        mailService.sendBookingCreated(user, booking);

        // 8. DTO zurückgeben (für 201 + Body)
        return new BookingDTO(
                booking.getId(),
                booking.getAppointmentTime(),
                user.getId(),
                category.getId(),
                category.getName(),
                user.getName()
        );
    }

    // Gibt alle Buchungen des aktuell angemeldeten Benutzers zurück
    public List<BookingDTO> getMyBookings() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String login = auth.getName();
        AppUser user = userRepository.findByEmailIgnoreCase(login).orElseThrow();

        return bookingRepository.findByUserId(user.getId())
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    // Gibt alle nicht bestätigten Buchungen zurück
    public List<BookingDTO> getUnconfirmedBookings() {
        return bookingRepository.findByStatus(BookingStatus.PENDING)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    // Gibt alle bestätigten Buchungen für den heutigen Tag zurück
    public List<BookingDTO> getBookingsForToday() {
        LocalDate today = LocalDate.now();
        return bookingRepository.findByStatusAndAppointmentTimeBetween(
                        BookingStatus.CONFIRMED, today.atStartOfDay(), today.atTime(23, 59, 59))
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    // Hilfsmethode zur Umwandlung der Buchung in ein BookingDTO
    private BookingDTO mapToDTO(Booking booking) {
        Category category = booking.getCategory();
        AppUser user = booking.getUser();

        return new BookingDTO(
                booking.getId(),
                booking.getAppointmentTime(),
                user.getId(),
                category != null ? category.getId() : null,
                category != null ? category.getName() : null,
                user.getName()
        );
    }

    //Buchung Löschen
    public void deleteById(Long bookingId) {
        if (!bookingRepository.existsById(bookingId)) {
            throw new IllegalArgumentException("Buchung mit ID " + bookingId + " existiert nicht.");
        }

        bookingRepository.deleteById(bookingId);
    }

    public List<LocalDateTime> getAllAppointmentTimes() {
        return bookingRepository.findAll()
                .stream()
                .map(booking -> booking.getAppointmentTime())
                .collect(Collectors.toList());
    }

}


