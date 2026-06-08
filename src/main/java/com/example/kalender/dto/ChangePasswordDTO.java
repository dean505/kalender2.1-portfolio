package com.example.kalender.dto;

public record ChangePasswordDTO(
        String currentPassword,
        String newPassword
) {}

