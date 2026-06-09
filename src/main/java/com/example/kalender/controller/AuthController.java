package com.example.kalender.controller;

import com.example.kalender.dto.LoginDTO;
import com.example.kalender.dto.RegisterDTO;
import com.example.kalender.dto.TokenResponseDTO;
import com.example.kalender.entity.AppUser;
import com.example.kalender.repository.AppUserRepository;
import com.example.kalender.config.JwtService;
import com.example.kalender.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

// Öffentliche Authentifizierung (Login & Registrierung)
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final JwtService jwtService;
    private final AuthenticationManager authManager;
    private final AppUserRepository userRepository;
    private final AuthService authService;

    public AuthController(JwtService jwtService, AuthenticationManager authManager,
                          AppUserRepository userRepository, AuthService authService) {
        this.jwtService = jwtService;
        this.authManager = authManager;
        this.userRepository = userRepository;
        this.authService = authService;
    }

    // Führt den Login durch und gibt ein JWT-Token zurück
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDTO dto) {
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.email(), dto.password())
        );
        AppUser user = userRepository.findByEmailIgnoreCase(dto.email()).orElseThrow();
        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(new TokenResponseDTO(token));
    }

    // Führt die Registrierung eines neuen Benutzers durch
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterDTO request) {
        authService.register(request);
        return ResponseEntity.ok().build();
    }
}
