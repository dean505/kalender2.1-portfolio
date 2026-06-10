package com.example.kalender.config;

import com.example.kalender.entity.Arbeitstag;
import com.example.kalender.entity.Master;
import com.example.kalender.entity.Oeffnungszeiten;
import com.example.kalender.repository.ArbeitstagRepository;
import com.example.kalender.repository.OeffnungszeitenRepository;
import com.example.kalender.service.MasterService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;

@Component
public class DefaultDataInitializer implements CommandLineRunner {

    private final OeffnungszeitenRepository oeffnungszeitenRepository;
    private final ArbeitstagRepository arbeitstagRepository;
    private final MasterService masterService;

    public DefaultDataInitializer(OeffnungszeitenRepository oeffnungszeitenRepository,
                                  ArbeitstagRepository arbeitstagRepository,
                                  MasterService masterService) {
        this.oeffnungszeitenRepository = oeffnungszeitenRepository;
        this.arbeitstagRepository = arbeitstagRepository;
        this.masterService = masterService;
    }

    @Override
    public void run(String... args) {
        LocalTime startUhrzeit = LocalTime.of(9, 0);
        LocalTime endUhrzeit = LocalTime.of(16, 0);
        Master defaultMaster = masterService.getDefaultMaster();
        masterService.ensureDefaultSchedulesForAllMasters();

        for (int weekOffset = 0; weekOffset <= 12; weekOffset++) {
            LocalDate currentMonday = LocalDate.now().plusWeeks(weekOffset).with(DayOfWeek.MONDAY);

            for (DayOfWeek tag : DayOfWeek.values()) {
                LocalDate datum = currentMonday.plusDays(tag.getValue() - 1);
                boolean istGesperrt = tag == DayOfWeek.SATURDAY || tag == DayOfWeek.SUNDAY;

                if (oeffnungszeitenRepository.findFirstByMasterIdAndWochentag(defaultMaster.getId(), tag).isEmpty()) {
                    Oeffnungszeiten neu = new Oeffnungszeiten(
                            tag,
                            istGesperrt ? null : startUhrzeit,
                            istGesperrt ? null : endUhrzeit
                    );
                    neu.setMaster(defaultMaster);
                    oeffnungszeitenRepository.save(neu);
                }

                if (arbeitstagRepository.findFirstByMasterIdAndDatum(defaultMaster.getId(), datum).isEmpty()) {
                    Arbeitstag tagNeu = new Arbeitstag(tag, istGesperrt, datum);
                    tagNeu.setMaster(defaultMaster);
                    arbeitstagRepository.save(tagNeu);
                }
            }
        }
    }
}
