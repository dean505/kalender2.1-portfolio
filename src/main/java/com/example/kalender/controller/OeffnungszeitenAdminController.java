package com.example.kalender.controller;

import com.example.kalender.entity.Oeffnungszeiten;
import com.example.kalender.service.MasterService;
import com.example.kalender.service.OeffnungszeitenService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/admin/oeffnungszeiten")
public class OeffnungszeitenAdminController {

    private final OeffnungszeitenService service;
    private final MasterService masterService;

    public OeffnungszeitenAdminController(OeffnungszeitenService service, MasterService masterService) {
        this.service = service;
        this.masterService = masterService;
    }

    @GetMapping("/datum/{date}")
    public ResponseEntity<Oeffnungszeiten> getOeffnungszeitenByDate(
            @PathVariable LocalDate date,
            @RequestParam(required = false) Long masterId
    ) {
        Long resolvedMasterId = masterId != null ? masterId : masterService.getDefaultMaster().getId();
        Oeffnungszeiten oeffnungszeiten = service.getOeffnungszeitenByDate(resolvedMasterId, date);
        return oeffnungszeiten != null
                ? ResponseEntity.ok(oeffnungszeiten)
                : ResponseEntity.notFound().build();
    }

    @PutMapping("/datum/{date}")
    public ResponseEntity<Oeffnungszeiten> updateOeffnungszeiten(
            @PathVariable LocalDate date,
            @RequestBody Oeffnungszeiten oeffnungszeiten,
            @RequestParam(required = false) Long masterId
    ) {
        Long resolvedMasterId = masterId != null ? masterId : masterService.getDefaultMaster().getId();
        return ResponseEntity.ok(service.saveForDate(resolvedMasterId, date, oeffnungszeiten));
    }
}
