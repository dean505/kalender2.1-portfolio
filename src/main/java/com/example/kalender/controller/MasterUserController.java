package com.example.kalender.controller;

import com.example.kalender.dto.MasterDTO;
import com.example.kalender.service.MasterService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/masters")
public class MasterUserController {

    private final MasterService masterService;

    public MasterUserController(MasterService masterService) {
        this.masterService = masterService;
    }

    @GetMapping
    public List<MasterDTO> findActiveMasters() {
        return masterService.findActiveMasters();
    }
}
