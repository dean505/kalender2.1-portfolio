package com.example.kalender.dto;

import java.util.List;

public record AvailableSlotsResponseDTO(
        boolean gesperrt,
        String startUhrzeit,
        String endUhrzeit,
        List<String> slots
) {}
