package com.example.kalender.dto;

import java.time.LocalDateTime;

public record AdminBookingRequest(
        Long userId,
        Long categoryId,
        LocalDateTime appointmentTime
) {}
