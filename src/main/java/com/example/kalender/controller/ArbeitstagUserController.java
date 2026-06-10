package com.example.kalender.controller;

import com.example.kalender.entity.Arbeitstag;
import com.example.kalender.service.ArbeitstagService;
import com.example.kalender.service.MasterService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/arbeitstag")
public class ArbeitstagUserController {

    private final ArbeitstagService arbeitstagService;
    private final MasterService masterService;

    public ArbeitstagUserController(ArbeitstagService arbeitstagService, MasterService masterService) {
        this.arbeitstagService = arbeitstagService;
        this.masterService = masterService;
    }

    @GetMapping("/datum/{date}")
    public ResponseEntity<Arbeitstag> getArbeitstagByDatum(
            @PathVariable LocalDate date,
            @RequestParam(required = false) Long masterId
    ) {
        Long resolvedMasterId = masterId != null ? masterId : masterService.getDefaultMaster().getId();
        return arbeitstagService.getArbeitstagByDate(resolvedMasterId, date)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
