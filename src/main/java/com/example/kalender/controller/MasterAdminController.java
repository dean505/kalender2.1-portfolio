package com.example.kalender.controller;

import com.example.kalender.dto.MasterDTO;
import com.example.kalender.service.MasterService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/masters")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
public class MasterAdminController {

    private final MasterService masterService;

    public MasterAdminController(MasterService masterService) {
        this.masterService = masterService;
    }

    @GetMapping
    public List<MasterDTO> findAllMasters() {
        return masterService.findAllMasters();
    }

    @PostMapping
    public MasterDTO create(@RequestBody MasterDTO dto) {
        return masterService.create(dto);
    }

    @PutMapping("/{id}")
    public MasterDTO update(@PathVariable Long id, @RequestBody MasterDTO dto) {
        return masterService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        masterService.delete(id);
    }
}
