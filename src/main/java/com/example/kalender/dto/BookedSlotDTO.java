package com.example.kalender.dto;

import java.time.LocalDateTime;

public record BookedSlotDTO(
        LocalDateTime appointmentTime,
        long durationMinutes
) {}
