package com.example.kalender.controller;

import com.example.kalender.dto.AdminCreateUserDTO;
import com.example.kalender.dto.UserDTO;
import com.example.kalender.repository.BookingRepository;
import com.example.kalender.service.AdminService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/users")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
public class UserAdminController {

    private final AdminService adminService;
    private final BookingRepository bookingRepository;

    public UserAdminController(AdminService adminService, BookingRepository bookingRepository) {
        this.adminService = adminService;
        this.bookingRepository = bookingRepository;
    }

    @GetMapping
    public List<UserDTO> getAllUsers() {
        return adminService.findAllUsers();
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        if (bookingRepository.existsByUserId(userId)) {
            throw new IllegalStateException("Benutzer hat noch Buchungen und kann nicht geloescht werden.");
        }
        adminService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{userId}/role")
    public ResponseEntity<Void> changeUserRole(@PathVariable Long userId, @Valid @RequestBody RoleChangeRequest request) {
        adminService.changeUserRole(userId, request.role());
        return ResponseEntity.ok().build();
    }

    @PostMapping
    public ResponseEntity<Long> createUser(@Valid @RequestBody AdminCreateUserDTO dto) {
        Long id = adminService.createUser(
                dto.name(),
                dto.email(),
                dto.telefonnummer(),
                dto.password(),
                dto.role() == null ? "USER" : dto.role()
        );
        return ResponseEntity.status(201).body(id);
    }

    public record RoleChangeRequest(@NotBlank String role) {}
}
