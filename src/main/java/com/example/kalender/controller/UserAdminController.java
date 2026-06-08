package com.example.kalender.controller;

import com.example.kalender.dto.UserDTO;
import com.example.kalender.repository.BookingRepository;
import com.example.kalender.service.AdminService;
import com.example.kalender.repository.AppUserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import com.example.kalender.dto.AdminCreateUserDTO;


import java.util.List;

// Nur für ADMINs – Benutzerverwaltung (Liste, löschen, Rolle ändern)
@RestController
@RequestMapping("/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserAdminController {

    private final AdminService adminService;
    private final AppUserRepository userRepository;
    private final BookingRepository bookingRepository;

    public UserAdminController(AdminService adminService, AppUserRepository userRepository, BookingRepository bookingRepository) {
        this.adminService = adminService;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
    }

    // Gibt eine Liste aller Benutzer zurück
    @GetMapping
    public List<UserDTO> getAllUsers() {
        return adminService.findAllUsers();
    }

    // Löscht einen Benutzer anhand der Benutzer-ID
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
        if (bookingRepository.existsByUserId(userId)) {
            throw new IllegalStateException("Benutzer hat noch Buchungen und kann nicht gelöscht werden.");
        }
        return ResponseEntity.noContent().build();
    }

    // Ändert die Rolle eines Benutzers
    @PutMapping("/{userId}/role")
    public ResponseEntity<Void> changeUserRole(@PathVariable Long userId, @RequestBody RoleChangeRequest request) {
        adminService.changeUserRole(userId, request.role());
        return ResponseEntity.ok().build();
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody AdminCreateUserDTO dto) {
        Long id = adminService.createUser(
                dto.name(),
                dto.email(),
                dto.telefonnummer(),
                dto.password(),
                dto.role() == null ? "USER" : dto.role()
        );
        return ResponseEntity.status(201).body(id);
    }

    // Hilfsklasse für die Rollenänderung eines Benutzers
    public record RoleChangeRequest(String role) {}
}


