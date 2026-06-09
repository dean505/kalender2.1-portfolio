package com.example.kalender.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordDTO(
        @NotBlank(message = "Aktuelles Passwort darf nicht leer sein")
        String currentPassword,

        @NotBlank(message = "Neues Passwort darf nicht leer sein")
        @Size(min = 8, message = "Neues Passwort muss mindestens 8 Zeichen haben")
        String newPassword
) {}
