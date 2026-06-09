package com.example.kalender.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginDTO(
        @NotBlank(message = "E-Mail darf nicht leer sein")
        @Email(message = "E-Mail muss gueltig sein")
        String email,

        @NotBlank(message = "Passwort darf nicht leer sein")
        String password
) {}
