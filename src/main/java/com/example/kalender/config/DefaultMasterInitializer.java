package com.example.kalender.config;

import com.example.kalender.entity.Booking;
import com.example.kalender.entity.Master;
import com.example.kalender.entity.Arbeitstag;
import com.example.kalender.entity.Oeffnungszeiten;
import com.example.kalender.repository.ArbeitstagRepository;
import com.example.kalender.repository.BookingRepository;
import com.example.kalender.repository.OeffnungszeitenRepository;
import com.example.kalender.service.MasterService;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DefaultMasterInitializer implements ApplicationRunner {

    private final MasterService masterService;
    private final BookingRepository bookingRepository;
    private final ArbeitstagRepository arbeitstagRepository;
    private final OeffnungszeitenRepository oeffnungszeitenRepository;

    public DefaultMasterInitializer(MasterService masterService, BookingRepository bookingRepository,
                                    ArbeitstagRepository arbeitstagRepository,
                                    OeffnungszeitenRepository oeffnungszeitenRepository) {
        this.masterService = masterService;
        this.bookingRepository = bookingRepository;
        this.arbeitstagRepository = arbeitstagRepository;
        this.oeffnungszeitenRepository = oeffnungszeitenRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        Master defaultMaster = masterService.getDefaultMaster();
        List<Booking> bookingsWithoutMaster = bookingRepository.findByMasterIsNull();

        if (bookingsWithoutMaster.isEmpty()) {
            backfillSchedule(defaultMaster);
            return;
        }

        bookingsWithoutMaster.forEach(booking -> booking.setMaster(defaultMaster));
        bookingRepository.saveAll(bookingsWithoutMaster);
        backfillSchedule(defaultMaster);
    }

    private void backfillSchedule(Master defaultMaster) {
        List<Arbeitstag> arbeitstageWithoutMaster = arbeitstagRepository.findByMasterIsNull();
        if (!arbeitstageWithoutMaster.isEmpty()) {
            arbeitstageWithoutMaster.forEach(arbeitstag -> arbeitstag.setMaster(defaultMaster));
            arbeitstagRepository.saveAll(arbeitstageWithoutMaster);
        }

        List<Oeffnungszeiten> oeffnungszeitenWithoutMaster = oeffnungszeitenRepository.findByMasterIsNull();
        if (!oeffnungszeitenWithoutMaster.isEmpty()) {
            oeffnungszeitenWithoutMaster.forEach(oeffnungszeiten -> oeffnungszeiten.setMaster(defaultMaster));
            oeffnungszeitenRepository.saveAll(oeffnungszeitenWithoutMaster);
        }
    }
}
