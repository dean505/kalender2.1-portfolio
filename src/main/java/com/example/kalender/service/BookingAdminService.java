package com.example.kalender.service;

import com.example.kalender.dto.AdminBookingRequest;
import com.example.kalender.dto.BookingDTO;
import com.example.kalender.entity.*;
import com.example.kalender.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingAdminService {

    private final BookingRepository bookingRepository;
    private final AppUserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ArbeitstagRepository arbeitstagRepository;
    private final OeffnungszeitenRepository oeffnungszeitenRepository;
    private final MailService mailService;
    private final MasterService masterService;

    public BookingAdminService(BookingRepository bookingRepository,
                               AppUserRepository userRepository,
                               CategoryRepository categoryRepository,
                               ArbeitstagRepository arbeitstagRepository,
                               OeffnungszeitenRepository oeffnungszeitenRepository, MailService mailService,
                               MasterService masterService) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.arbeitstagRepository = arbeitstagRepository;
        this.oeffnungszeitenRepository = oeffnungszeitenRepository;
        this.mailService = mailService;
        this.masterService = masterService;
    }

    // Admin legt eine Buchung gezielt für userId an (nicht den eingeloggten Admin!)
    @Transactional
    public BookingDTO createForUser(AdminBookingRequest req) {
        AppUser targetUser = userRepository.findById(req.userId())
                .orElseThrow(() -> new IllegalStateException("Benutzer nicht gefunden: " + req.userId()));

        Category category = categoryRepository.findById(req.categoryId())
                .orElseThrow(() -> new IllegalStateException("Kategorie nicht gefunden: " + req.categoryId()));
        Master master = masterService.resolveMaster(req.masterId());

        LocalDateTime start = req.appointmentTime();
        LocalDate date = start.toLocalDate();
        // Wenn du 10 Minuten Puffer willst, hier ergänzen:
        LocalDateTime end = start.plusMinutes(category.getDurationMinutes()); // .plusMinutes(10)

        // 1) Nutzer-spezifische Kollision
        boolean userConflict = bookingRepository.hasBookingConflict(targetUser.getId(), start, end);
        if (userConflict) {
            throw new IllegalStateException("Der ausgewählte Nutzer hat bereits eine Buchung in diesem Zeitraum.");
        }

        // 2) Gesperrter Arbeitstag?
        var arbeitstag = arbeitstagRepository.findByDatum(date).orElse(null);
        if (arbeitstag != null && arbeitstag.isIstGesperrt()) {
            throw new IllegalStateException("Der gewählte Tag ist gesperrt.");
        }

        // 3) Öffnungszeiten?
        var oeffnung = oeffnungszeitenRepository.findByWochentag(date.getDayOfWeek()).orElse(null);
        if (oeffnung == null || oeffnung.getStartUhrzeit() == null || oeffnung.getEndUhrzeit() == null) {
            throw new IllegalStateException("Keine Öffnungszeiten vorhanden.");
        }
        if (start.toLocalTime().isBefore(oeffnung.getStartUhrzeit()) ||
                end.toLocalTime().isAfter(oeffnung.getEndUhrzeit())) {
            throw new IllegalStateException("Buchung außerhalb der Öffnungszeiten.");
        }

        // 4) Kollision im Kalender des Masters
        List<Booking> allBookings = bookingRepository.findAllByMasterAndDate(master.getId(), date);
        boolean anyConflict = allBookings.stream().anyMatch(existing -> {
            LocalDateTime existingStart = existing.getAppointmentTime();
            LocalDateTime existingEnd = existingStart.plusMinutes(existing.getCategory().getDurationMinutes());
            return existingStart.isBefore(end) && existingEnd.isAfter(start);
        });
        if (anyConflict) {
            throw new IllegalStateException("Zeitkollision mit einer bestehenden Buchung.");
        }

        // 5) Speichern
        Booking booking = new Booking();
        booking.setUser(targetUser);            // 🔴 entscheidend: gewählter User, nicht Admin
        booking.setCategory(category);
        booking.setMaster(master);
        booking.setAppointmentTime(start);
        booking.setStatus(BookingStatus.PENDING);

        bookingRepository.save(booking);

        // ✉️ Mail an Zielnutzer: Buchung erstellt (PENDING)
        mailService.sendBookingCreated(targetUser, booking);


        return new BookingDTO(
                booking.getId(),
                booking.getAppointmentTime(),
                targetUser.getId(),
                category.getId(),
                category.getName(),
                targetUser.getName(),
                master.getId(),
                master.getName()
        );
    }
}
