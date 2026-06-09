package com.example.kalender.config;

import com.example.kalender.entity.Booking;
import com.example.kalender.entity.Master;
import com.example.kalender.repository.BookingRepository;
import com.example.kalender.service.MasterService;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DefaultMasterInitializer implements ApplicationRunner {

    private final MasterService masterService;
    private final BookingRepository bookingRepository;

    public DefaultMasterInitializer(MasterService masterService, BookingRepository bookingRepository) {
        this.masterService = masterService;
        this.bookingRepository = bookingRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        Master defaultMaster = masterService.getDefaultMaster();
        List<Booking> bookingsWithoutMaster = bookingRepository.findByMasterIsNull();

        if (bookingsWithoutMaster.isEmpty()) {
            return;
        }

        bookingsWithoutMaster.forEach(booking -> booking.setMaster(defaultMaster));
        bookingRepository.saveAll(bookingsWithoutMaster);
    }
}
