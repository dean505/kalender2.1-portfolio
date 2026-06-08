package com.example.kalender.config;

import com.example.kalender.entity.Arbeitstag;
import com.example.kalender.entity.Oeffnungszeiten;
import com.example.kalender.repository.ArbeitstagRepository;
import com.example.kalender.repository.OeffnungszeitenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;

@Component
public class DefaultDataInitializer implements CommandLineRunner {

    @Autowired
    private OeffnungszeitenRepository oeffnungszeitenRepository;

    @Autowired
    private ArbeitstagRepository arbeitstagRepository;

    // Wird beim Starten der Anwendung ausgeführt, um Standardwerte zu setzen
    @Override
    public void run(String... args) throws Exception {
        // Standard-Arbeitszeiten (außer Wochenende)
        LocalTime startUhrzeit = LocalTime.of(9, 0);
        LocalTime endUhrzeit = LocalTime.of(16, 0);

        // Für die nächsten 12 Wochen (inklusive dieser Woche = offset 0)
        for (int weekOffset = 0; weekOffset <= 12; weekOffset++) {
            // Bestimme den Montag der aktuellen Woche (oder der nächsten Wochen)
            LocalDate currentMonday = LocalDate.now().plusWeeks(weekOffset).with(DayOfWeek.MONDAY);

            // Iteriere über alle Tage der Woche
            for (DayOfWeek tag : DayOfWeek.values()) {
                // Bestimme das Datum des aktuellen Tages
                LocalDate datum = currentMonday.plusDays(tag.getValue() - 1);
                boolean istGesperrt = (tag == DayOfWeek.SATURDAY || tag == DayOfWeek.SUNDAY); // Wochenenden sperren

                // Öffnungszeiten prüfen und ggf. anlegen
                if (oeffnungszeitenRepository.findByWochentag(tag).isEmpty()) {
                    // Öffnungszeiten für den Tag anlegen
                    Oeffnungszeiten neu = new Oeffnungszeiten(
                            tag,
                            istGesperrt ? null : startUhrzeit, // Keine Öffnungszeiten an Wochenenden
                            istGesperrt ? null : endUhrzeit
                    );
                    oeffnungszeitenRepository.save(neu);
                }

                // Arbeitstag prüfen und ggf. anlegen
                if (arbeitstagRepository.findByDatum(datum).isEmpty()) {
                    // Arbeitstag für den Tag anlegen
                    Arbeitstag tagNeu = new Arbeitstag(tag, istGesperrt, datum);
                    arbeitstagRepository.save(tagNeu);
                }
            }
        }
    }
}





