package com.example.kalender.service;

import com.example.kalender.entity.Arbeitstag;
import com.example.kalender.entity.Master;
import com.example.kalender.repository.ArbeitstagRepository;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Optional;

@Service
public class ArbeitstagService {

    private final ArbeitstagRepository arbeitstagRepository;
    private final MasterService masterService;

    public ArbeitstagService(ArbeitstagRepository arbeitstagRepository, MasterService masterService) {
        this.arbeitstagRepository = arbeitstagRepository;
        this.masterService = masterService;
    }

    public Arbeitstag setArbeitstagStatus(DayOfWeek wochentag, boolean istGesperrt) {
        Master master = masterService.getDefaultMaster();
        return setArbeitstagStatus(master.getId(), wochentag, istGesperrt);
    }

    public Arbeitstag setArbeitstagStatus(Long masterId, DayOfWeek wochentag, boolean istGesperrt) {
        Master master = masterService.resolveMaster(masterId);
        Arbeitstag arbeitstag = arbeitstagRepository.findFirstByMasterIdAndWochentag(master.getId(), wochentag)
                .orElseGet(() -> {
                    Arbeitstag neu = new Arbeitstag(wochentag, istGesperrt);
                    neu.setMaster(master);
                    return neu;
                });

        arbeitstag.setIstGesperrt(istGesperrt);
        return arbeitstagRepository.save(arbeitstag);
    }

    public boolean isArbeitstagGesperrt(DayOfWeek wochentag) {
        Master master = masterService.getDefaultMaster();
        return isArbeitstagGesperrt(master.getId(), wochentag);
    }

    public boolean isArbeitstagGesperrt(Long masterId, DayOfWeek wochentag) {
        Master master = masterService.resolveMaster(masterId);
        return arbeitstagRepository.findFirstByMasterIdAndWochentag(master.getId(), wochentag)
                .map(Arbeitstag::isIstGesperrt)
                .orElse(false);
    }

    public Optional<Arbeitstag> getArbeitstagByDate(LocalDate date) {
        Master master = masterService.getDefaultMaster();
        return getArbeitstagByDate(master.getId(), date);
    }

    public Optional<Arbeitstag> getArbeitstagByDate(Long masterId, LocalDate date) {
        Master master = masterService.resolveMaster(masterId);
        return arbeitstagRepository.findFirstByMasterIdAndDatum(master.getId(), date);
    }

    public Arbeitstag saveForDate(Long masterId, LocalDate date, boolean istGesperrt) {
        Master master = masterService.resolveMaster(masterId);
        Arbeitstag arbeitstag = arbeitstagRepository.findFirstByMasterIdAndDatum(master.getId(), date)
                .orElseGet(() -> {
                    Arbeitstag neu = new Arbeitstag(date.getDayOfWeek(), istGesperrt, date);
                    neu.setMaster(master);
                    return neu;
                });

        arbeitstag.setWochentag(date.getDayOfWeek());
        arbeitstag.setDatum(date);
        arbeitstag.setMaster(master);
        arbeitstag.setIstGesperrt(istGesperrt);
        return arbeitstagRepository.save(arbeitstag);
    }
}
