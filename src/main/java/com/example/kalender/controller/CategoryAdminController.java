package com.example.kalender.controller;

import com.example.kalender.dto.CategoryDTO;
import com.example.kalender.service.CategoryService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

// Nur für ADMINs – Kategorien verwalten
@RestController
@RequestMapping("/admin/categories")
@PreAuthorize("hasRole('ADMIN')")
public class CategoryAdminController {

    private final CategoryService categoryService;

    public CategoryAdminController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    // Erstellt eine neue Kategorie
    @PostMapping
    public CategoryDTO create(@RequestBody CategoryDTO dto) {
        return categoryService.create(dto);
    }

    // Aktualisiert eine vorhandene Kategorie
    @PutMapping("/{id}")
    public CategoryDTO update(@PathVariable Long id, @RequestBody CategoryDTO dto) {
        return categoryService.update(id, dto);
    }

    // Löscht eine Kategorie anhand der ID
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        categoryService.delete(id);
    }
}


