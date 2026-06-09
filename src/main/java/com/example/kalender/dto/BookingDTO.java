package com.example.kalender.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record BookingDTO(
        Long id,
        @NotNull(message = "Terminzeit muss ausgewaehlt sein")
        LocalDateTime appointmentTime,

        Long userId,

        @NotNull(message = "Leistung muss ausgewaehlt sein")
        Long categoryId,

        String categoryName,
        String userName,

        Long masterId,
        String masterName
) {}
