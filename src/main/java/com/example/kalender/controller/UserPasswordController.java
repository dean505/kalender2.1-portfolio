package com.example.kalender.controller;

import com.example.kalender.dto.ChangePasswordDTO;
import com.example.kalender.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserPasswordController {

    private final AuthService authService;

    public UserPasswordController(AuthService authService) {
        this.authService = authService;
    }

    @PutMapping("/me/password")
    public ResponseEntity<?> changeOwnPassword(@Valid @RequestBody ChangePasswordDTO dto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String login = auth.getName(); // = E-Mail
        authService.changeOwnPassword(login, dto.currentPassword(), dto.newPassword());
        return ResponseEntity.noContent().build(); // 204
    }
}
