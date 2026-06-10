package com.example.kalender.service;

import com.example.kalender.dto.MasterDTO;
import com.example.kalender.entity.Arbeitstag;
import com.example.kalender.entity.Master;
import com.example.kalender.entity.Oeffnungszeiten;
import com.example.kalender.repository.ArbeitstagRepository;
import com.example.kalender.repository.BookingRepository;
import com.example.kalender.repository.MasterRepository;
import com.example.kalender.repository.OeffnungszeitenRepository;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class MasterService {

    private static final String DEFAULT_MASTER_NAME = "Default Master";

    private final MasterRepository masterRepository;
    private final BookingRepository bookingRepository;
    private final ArbeitstagRepository arbeitstagRepository;
    private final OeffnungszeitenRepository oeffnungszeitenRepository;

    public MasterService(MasterRepository masterRepository, BookingRepository bookingRepository,
                         ArbeitstagRepository arbeitstagRepository,
                         OeffnungszeitenRepository oeffnungszeitenRepository) {
        this.masterRepository = masterRepository;
        this.bookingRepository = bookingRepository;
        this.arbeitstagRepository = arbeitstagRepository;
        this.oeffnungszeitenRepository = oeffnungszeitenRepository;
    }

    public List<MasterDTO> findActiveMasters() {
        return masterRepository.findByActiveTrueOrderByNameAsc()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public List<MasterDTO> findAllMasters() {
        return masterRepository.findAllByOrderByNameAsc()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public Master getDefaultMaster() {
        return masterRepository.findFirstByDefaultMasterTrue()
                .orElseGet(this::createDefaultMaster);
    }

    public Master resolveMaster(Long masterId) {
        if (masterId == null) {
            return getDefaultMaster();
        }

        return masterRepository.findById(masterId)
                .orElseThrow(() -> new IllegalStateException("Master nicht gefunden: " + masterId));
    }

    public MasterDTO create(MasterDTO dto) {
        Master master = new Master();
        apply(dto, master);
        master.setDefaultMaster(false);
        Master saved = masterRepository.save(master);
        ensureDefaultSchedule(saved);
        return toDTO(saved);
    }

    public MasterDTO update(Long id, MasterDTO dto) {
        Master master = masterRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Master nicht gefunden: " + id));

        apply(dto, master);
        return toDTO(masterRepository.save(master));
    }

    public void delete(Long id) {
        Master master = masterRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Master nicht gefunden: " + id));

        if (master.isDefaultMaster()) {
            throw new IllegalStateException("Der Standard-Master kann nicht geloescht werden.");
        }
        if (bookingRepository.existsByMasterId(id)) {
            throw new IllegalStateException("Master mit bestehenden Buchungen kann nicht geloescht werden.");
        }

        masterRepository.delete(master);
    }

    private Master createDefaultMaster() {
        Master master = new Master();
        master.setName(DEFAULT_MASTER_NAME);
        master.setDescription("Initialer Kalenderinhaber");
        master.setDefaultMaster(true);
        master.setActive(true);
        Master saved = masterRepository.save(master);
        ensureDefaultSchedule(saved);
        return saved;
    }

    public void ensureDefaultSchedulesForAllMasters() {
        masterRepository.findAll().forEach(this::ensureDefaultSchedule);
    }

    public void ensureDefaultSchedule(Master master) {
        LocalTime startUhrzeit = LocalTime.of(9, 0);
        LocalTime endUhrzeit = LocalTime.of(16, 0);

        for (DayOfWeek tag : DayOfWeek.values()) {
            boolean istGesperrt = tag == DayOfWeek.SATURDAY || tag == DayOfWeek.SUNDAY;

            if (oeffnungszeitenRepository.findFirstByMasterIdAndWochentag(master.getId(), tag).isEmpty()) {
                Oeffnungszeiten oeffnungszeiten = new Oeffnungszeiten(
                        tag,
                        istGesperrt ? null : startUhrzeit,
                        istGesperrt ? null : endUhrzeit
                );
                oeffnungszeiten.setMaster(master);
                oeffnungszeitenRepository.save(oeffnungszeiten);
            }
        }

        for (int weekOffset = 0; weekOffset <= 12; weekOffset++) {
            LocalDate currentMonday = LocalDate.now().plusWeeks(weekOffset).with(DayOfWeek.MONDAY);

            for (DayOfWeek tag : DayOfWeek.values()) {
                LocalDate datum = currentMonday.plusDays(tag.getValue() - 1);
                boolean istGesperrt = tag == DayOfWeek.SATURDAY || tag == DayOfWeek.SUNDAY;

                if (arbeitstagRepository.findFirstByMasterIdAndDatum(master.getId(), datum).isEmpty()) {
                    Arbeitstag arbeitstag = new Arbeitstag(tag, istGesperrt, datum);
                    arbeitstag.setMaster(master);
                    arbeitstagRepository.save(arbeitstag);
                }
            }
        }
    }

    private void apply(MasterDTO dto, Master master) {
        if (dto.name() == null || dto.name().trim().isEmpty()) {
            throw new IllegalArgumentException("Name muss ausgefuellt sein.");
        }

        master.setName(dto.name().trim());
        master.setDescription(dto.description());
        master.setActive(dto.active());
    }

    private MasterDTO toDTO(Master master) {
        return new MasterDTO(
                master.getId(),
                master.getName(),
                master.getDescription(),
                master.isActive(),
                master.isDefaultMaster()
        );
    }
}
