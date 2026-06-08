package com.example.kalender.repository;

import com.example.kalender.entity.AppUser;
import com.example.kalender.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    // Sucht einen Benutzer anhand der E-Mail (ignoriere Groß-/Kleinschreibung)
    Optional<AppUser> findByEmailIgnoreCase(String email);

    // Prüft, ob ein Benutzer mit der angegebenen E-Mail existiert (ignoriere Groß-/Kleinschreibung)
    boolean existsByEmailIgnoreCase(String email);

    // Sucht den ersten Benutzer mit der angegebenen Rolle
    Optional<AppUser> findFirstByRole(Role role);
}

