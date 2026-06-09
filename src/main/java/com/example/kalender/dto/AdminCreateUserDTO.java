package com.example.kalender.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminCreateUserDTO(
        @NotBlank(message = "Name darf nicht leer sein")
        String name,

        @NotBlank(message = "E-Mail darf nicht leer sein")
        @Email(message = "E-Mail muss gueltig sein")
        String email,

        String telefonnummer,

        @NotBlank(message = "Passwort darf nicht leer sein")
        @Size(min = 8, message = "Passwort muss mindestens 8 Zeichen haben")
        String password,

        String role
) {}
