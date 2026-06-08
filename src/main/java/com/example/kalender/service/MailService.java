package com.example.kalender.service;

import com.example.kalender.entity.AppUser;
import com.example.kalender.entity.Booking;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${kalender.mail.enabled:true}")
    private boolean enabled;

    @Value("${kalender.mail.from:no-reply@example.com}")
    private String from;

    private static final DateTimeFormatter DF = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");

    public MailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendBookingCreated(AppUser user, Booking booking) {
        if (!enabled || user.getEmail() == null) return;

        String subject = "Ihre Buchung wurde erstellt";
        String text = """
                Hallo %s,

                wir haben Ihre Buchung erfasst.

                Leistung: %s
                Termin:   %s
                Status:   %s

                Sie erhalten eine weitere E-Mail, sobald der Termin bestätigt wurde.

                Freundliche Grüße
                """.formatted(
                safe(user.getName()),
                booking.getCategory() != null ? booking.getCategory().getName() : "—",
                DF.format(booking.getAppointmentTime()),
                booking.getStatus().name()
        );

        send(user.getEmail(), subject, text);
    }

    @Async
    public void sendBookingConfirmed(AppUser user, Booking booking) {
        if (!enabled || user.getEmail() == null) return;

        String subject = "Termin bestätigt";
        String text = """
                Hallo %s,

                Ihr Termin wurde bestätigt!

                Leistung: %s
                Termin:   %s
                Status:   %s

                Bis bald!
                """.formatted(
                safe(user.getName()),
                booking.getCategory() != null ? booking.getCategory().getName() : "—",
                DF.format(booking.getAppointmentTime()),
                booking.getStatus().name()
        );

        send(user.getEmail(), subject, text);
    }

    @Async
    public void sendBookingRejected(AppUser user, Booking booking) {
        if (!enabled || user.getEmail() == null) return;

        String subject = "Termin abgelehnt";
        String text = """
                Hallo %s,

                leider musste der folgende Termin abgelehnt werden:

                Leistung: %s
                Termin:   %s
                Status:   %s

                Bitte wählen Sie einen anderen Zeitpunkt.
                """.formatted(
                safe(user.getName()),
                booking.getCategory() != null ? booking.getCategory().getName() : "—",
                DF.format(booking.getAppointmentTime()),
                booking.getStatus().name()
        );

        send(user.getEmail(), subject, text);
    }

    @Async
    public void sendWelcome(AppUser user) {
        if (!enabled || user == null || user.getEmail() == null) return;

        String subject = "Willkommen bei Ihrem Terminportal";
        String text = """
            Hallo %s,

            schön, dass Sie da sind! Ihr Konto wurde erfolgreich angelegt.

            Sie können sich ab sofort mit Ihrer E-Mail-Adresse %s anmelden
            und Termine buchen.

            Freundliche Grüße
            """.formatted(
                safe(user.getName()),
                user.getEmail()
        );

        send(user.getEmail(), subject, text);
    }

    private void send(String to, String subject, String text) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(from);
            msg.setTo(to);
            msg.setSubject(subject);
            msg.setText(text);
            mailSender.send(msg);
        } catch (Exception e) {
            // absichtlich nur loggen – die App soll deshalb nicht fehlschlagen
            System.err.println("E-Mail-Versand fehlgeschlagen: " + e.getMessage());
        }
    }

    private String safe(String s) {
        return (s == null || s.isBlank()) ? "Kunde" : s;
    }
}
