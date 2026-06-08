package com.example.kalender.service;

import com.example.kalender.dto.RegisterDTO;
import com.example.kalender.entity.AppUser;
import com.example.kalender.entity.Role;
import com.example.kalender.repository.AppUserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;

    public AuthService(AppUserRepository userRepository, PasswordEncoder passwordEncoder, MailService mailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailService = mailService;
    }

    // Registriert einen neuen Benutzer
    public void register(RegisterDTO dto) {
        // Überprüft, ob die E-Mail-Adresse bereits vergeben ist
        if (userRepository.existsByEmailIgnoreCase(dto.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-Mail bereits vergeben");
        }

        // Benutzer anlegen
        AppUser user = new AppUser();
        user.setName(dto.name());
        user.setPassword(passwordEncoder.encode(dto.password())); // Passwort verschlüsseln
        user.setEmail(dto.email());
        user.setTelefonnummer(dto.telefonnummer());
        user.setRole(Role.USER); // Standardrolle

        userRepository.save(user);

        // ✉️ Willkommens-Mail asynchron senden (Fehler werden im Service geloggt)
        mailService.sendWelcome(user);                    // ✨ NEU
    }

    // eigenes Passwort ändern
    public void changeOwnPassword(String loginEmail, String currentPassword, String newPassword) {
        AppUser user = userRepository.findByEmailIgnoreCase(loginEmail)
                .orElseThrow(() -> new IllegalStateException("Benutzer nicht gefunden"));

        if (currentPassword == null || currentPassword.isBlank()
                || newPassword == null || newPassword.isBlank()) {
            throw new IllegalArgumentException("Passwörter dürfen nicht leer sein.");
        }
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Aktuelles Passwort ist falsch.");
        }
        validateNewPassword(newPassword, user.getEmail());
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    // einfache Policy – gern anpassen
    private void validateNewPassword(String pw, String email) {
        if (pw.length() < 8) throw new IllegalArgumentException("Passwort muss mindestens 8 Zeichen haben.");
        if (email != null && pw.equalsIgnoreCase(email))
            throw new IllegalArgumentException("Passwort darf nicht der E-Mail entsprechen.");
        // Optional stärker:
        if (!pw.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$"))
            throw new IllegalArgumentException("Passwort zu schwach (Groß/Klein/Zahl).");
    }
}


