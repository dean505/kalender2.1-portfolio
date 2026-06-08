package com.example.kalender.service;

import com.example.kalender.dto.UserDTO;
import com.example.kalender.entity.AppUser;
import com.example.kalender.entity.Role;
import com.example.kalender.repository.AppUserRepository;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class AdminService {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder; // <— hinzufügen

    public AdminService(AppUserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Gibt alle Benutzer als DTOs zurück
    public List<UserDTO> findAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> new UserDTO(user.getId(), user.getName(), user.getEmail(), user.getTelefonnummer(), user.getRole().name()))
                .toList();
    }

    // Löscht einen Benutzer anhand der Benutzer-ID
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new NoSuchElementException("Benutzer nicht gefunden");
        }
        userRepository.deleteById(userId);
    }

    // Ändert die Rolle eines Benutzers
    public void changeUserRole(Long userId, String newRole) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("Benutzer nicht gefunden"));

        user.setRole(Role.valueOf(newRole));
        userRepository.save(user);
    }

    // Erstelt einen Benutzere
    public Long createUser(String name, String email, String tel, String rawPassword, String role) {
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalStateException("E-Mail bereits vergeben");
        }
        AppUser u = new AppUser();
        u.setName(name);
        u.setEmail(email);
        u.setTelefonnummer(tel);
        u.setPassword(passwordEncoder.encode(rawPassword));
        u.setRole(Role.valueOf(role)); // "USER"/"ADMIN"
        userRepository.save(u);
        return u.getId();
    }
}

