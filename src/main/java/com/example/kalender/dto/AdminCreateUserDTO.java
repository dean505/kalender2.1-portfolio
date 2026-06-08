// src/main/java/com/example/kalender/dto/AdminCreateUserDTO.java
package com.example.kalender.dto;

public record AdminCreateUserDTO(
        String name,
        String email,
        String telefonnummer,
        String password,
        String role // "USER" oder "ADMIN"
) {}

