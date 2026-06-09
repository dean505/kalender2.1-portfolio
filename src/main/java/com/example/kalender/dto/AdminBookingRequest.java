package com.example.kalender.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record AdminBookingRequest(
        @NotNull(message = "Benutzer muss ausgewaehlt sein")
        Long userId,

        @NotNull(message = "Leistung muss ausgewaehlt sein")
        Long categoryId,

        @NotNull(message = "Terminzeit muss ausgewaehlt sein")
        LocalDateTime appointmentTime,

        Long masterId
) {}
