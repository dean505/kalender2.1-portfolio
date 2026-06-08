package com.example.kalender.controller;

import com.example.kalender.dto.CategoryDTO;
import com.example.kalender.service.CategoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Für alle Benutzer – Kategorien abrufen
@RestController
@RequestMapping("/api/categories")
public class CategoryUserController {

    private final CategoryService categoryService;

    public CategoryUserController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    // Gibt alle Kategorien zurück
    @GetMapping
    public List<CategoryDTO> getAll() {
        return categoryService.findAll();
    }

    // Gibt eine Kategorie anhand der ID zurück
    @GetMapping("/{id}")
    public CategoryDTO getById(@PathVariable Long id) {
        return categoryService.findById(id);
    }
}


