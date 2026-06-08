package com.example.kalender.repository;

import com.example.kalender.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

// Repository für die Verwaltung von Kategorien
public interface CategoryRepository extends JpaRepository<Category, Long> {
    // Erbt alle Standardmethoden von JpaRepository für CRUD-Operationen
}



