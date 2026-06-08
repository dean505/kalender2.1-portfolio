package com.example.kalender.service;

import com.example.kalender.dto.CategoryDTO;
import com.example.kalender.entity.Category;
import com.example.kalender.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    // Gibt alle Kategorien als DTOs zurück
    public List<CategoryDTO> findAll() {
        return categoryRepository.findAll()
                .stream()
                .map(this::toDTO) // Umwandlung von Category in CategoryDTO
                .collect(Collectors.toList());
    }

    // Gibt eine Kategorie anhand der ID zurück
    public CategoryDTO findById(Long id) {
        return categoryRepository.findById(id)
                .map(this::toDTO) // Umwandlung von Category in CategoryDTO
                .orElseThrow(() -> new RuntimeException("Kategorie nicht gefunden"));
    }

    // Erstellt eine neue Kategorie
    public CategoryDTO create(CategoryDTO dto) {
        Category category = new Category();
        category.setName(dto.name());
        category.setDescription(dto.description());
        category.setDurationMinutes(dto.durationMinutes()); // Setzt die Dauer der Kategorie

        category = categoryRepository.save(category); // Speichert die neue Kategorie
        return toDTO(category); // Gibt die gespeicherte Kategorie als DTO zurück
    }

    // Aktualisiert eine bestehende Kategorie
    public CategoryDTO update(Long id, CategoryDTO dto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kategorie nicht gefunden"));

        category.setName(dto.name());
        category.setDescription(dto.description());
        category.setDurationMinutes(dto.durationMinutes()); // Setzt die Dauer der Kategorie

        category = categoryRepository.save(category); // Speichert die aktualisierte Kategorie
        return toDTO(category); // Gibt die aktualisierte Kategorie als DTO zurück
    }

    // Löscht eine Kategorie anhand der ID
    public void delete(Long id) {
        categoryRepository.deleteById(id); // Löscht die Kategorie
    }

    // Hilfsmethode, um eine Kategorie in ein DTO umzuwandeln
    private CategoryDTO toDTO(Category category) {
        return new CategoryDTO(category.getId(), category.getName(), category.getDescription(), category.getDurationMinutes());
    }
}


