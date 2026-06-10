package com.example.kalender.dto;

public record MasterDTO(
        Long id,
        String name,
        String description,
        boolean active,
        boolean defaultMaster
) {}
