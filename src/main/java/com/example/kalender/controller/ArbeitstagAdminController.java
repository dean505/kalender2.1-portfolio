package com.example.kalender.controller;

import com.example.kalender.entity.Arbeitstag;
import com.example.kalender.service.ArbeitstagService;
import com.example.kalender.service.MasterService;
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
@RequestMapping("/admin/arbeitstag")
public class ArbeitstagAdminController {

    private final ArbeitstagService arbeitstagService;
    private final MasterService masterService;

    public ArbeitstagAdminController(ArbeitstagService arbeitstagService, MasterService masterService) {
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

    @PutMapping("/datum/{date}")
    public ResponseEntity<Arbeitstag> updateArbeitstag(
            @PathVariable LocalDate date,
            @RequestBody Arbeitstag arbeitstag,
            @RequestParam(required = false) Long masterId
    ) {
        Long resolvedMasterId = masterId != null ? masterId : masterService.getDefaultMaster().getId();
        return ResponseEntity.ok(
                arbeitstagService.saveForDate(resolvedMasterId, date, arbeitstag.isIstGesperrt())
        );
    }

    @PutMapping("/datum/{date}/freigeben")
    public ResponseEntity<Arbeitstag> gibFeiertagFrei(
            @PathVariable LocalDate date,
            @RequestParam(required = false) Long masterId
    ) {
        Long resolvedMasterId = masterId != null ? masterId : masterService.getDefaultMaster().getId();
        return ResponseEntity.ok(arbeitstagService.saveForDate(resolvedMasterId, date, false));
    }

    @PutMapping("/datum/{date}/sperren")
    public ResponseEntity<Arbeitstag> sperreArbeitstag(
            @PathVariable LocalDate date,
            @RequestParam(required = false) Long masterId
    ) {
        Long resolvedMasterId = masterId != null ? masterId : masterService.getDefaultMaster().getId();
        return ResponseEntity.ok(arbeitstagService.saveForDate(resolvedMasterId, date, true));
    }
}
