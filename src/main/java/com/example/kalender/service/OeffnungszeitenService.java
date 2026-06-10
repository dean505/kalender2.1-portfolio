package com.example.kalender.service;

import com.example.kalender.entity.Master;
import com.example.kalender.entity.Oeffnungszeiten;
import com.example.kalender.repository.OeffnungszeitenRepository;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;

@Service
public class OeffnungszeitenService {

    private final OeffnungszeitenRepository oeffnungszeitenRepository;
    private final MasterService masterService;

    public OeffnungszeitenService(OeffnungszeitenRepository oeffnungszeitenRepository, MasterService masterService) {
        this.oeffnungszeitenRepository = oeffnungszeitenRepository;
        this.masterService = masterService;
    }

    public Oeffnungszeiten getOeffnungszeiten(DayOfWeek wochentag) {
        Master master = masterService.getDefaultMaster();
        return getOeffnungszeiten(master.getId(), wochentag);
    }

    public Oeffnungszeiten getOeffnungszeiten(Long masterId, DayOfWeek wochentag) {
        Master master = masterService.resolveMaster(masterId);
        return oeffnungszeitenRepository.findFirstByMasterIdAndWochentag(master.getId(), wochentag)
                .orElse(null);
    }

    public Oeffnungszeiten getOeffnungszeitenByDate(Long masterId, LocalDate date) {
        return getOeffnungszeiten(masterId, date.getDayOfWeek());
    }

    public Oeffnungszeiten updateOeffnungszeiten(DayOfWeek wochentag, Oeffnungszeiten newOeffnungszeiten) {
        Master master = masterService.getDefaultMaster();
        return updateOeffnungszeiten(master.getId(), wochentag, newOeffnungszeiten);
    }

    public Oeffnungszeiten updateOeffnungszeiten(Long masterId, DayOfWeek wochentag, Oeffnungszeiten newOeffnungszeiten) {
        Oeffnungszeiten existing = getOeffnungszeiten(masterId, wochentag);

        if (existing == null) {
            return null;
        }

        existing.setStartUhrzeit(newOeffnungszeiten.getStartUhrzeit());
        existing.setEndUhrzeit(newOeffnungszeiten.getEndUhrzeit());
        return oeffnungszeitenRepository.save(existing);
    }

    public Oeffnungszeiten saveOeffnungszeiten(Oeffnungszeiten oeffnungszeiten) {
        if (oeffnungszeiten.getMaster() == null) {
            oeffnungszeiten.setMaster(masterService.getDefaultMaster());
        }
        return oeffnungszeitenRepository.save(oeffnungszeiten);
    }

    public Oeffnungszeiten saveForDate(Long masterId, LocalDate date, Oeffnungszeiten newOeffnungszeiten) {
        Master master = masterService.resolveMaster(masterId);
        Oeffnungszeiten oeffnungszeiten = oeffnungszeitenRepository
                .findFirstByMasterIdAndWochentag(master.getId(), date.getDayOfWeek())
                .orElseGet(() -> {
                    Oeffnungszeiten neu = new Oeffnungszeiten();
                    neu.setMaster(master);
                    neu.setWochentag(date.getDayOfWeek());
                    return neu;
                });

        oeffnungszeiten.setMaster(master);
        oeffnungszeiten.setWochentag(date.getDayOfWeek());
        oeffnungszeiten.setStartUhrzeit(newOeffnungszeiten.getStartUhrzeit());
        oeffnungszeiten.setEndUhrzeit(newOeffnungszeiten.getEndUhrzeit());
        return oeffnungszeitenRepository.save(oeffnungszeiten);
    }
}
