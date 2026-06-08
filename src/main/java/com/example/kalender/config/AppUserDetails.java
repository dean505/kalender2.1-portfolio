package com.example.kalender.config;

import com.example.kalender.entity.AppUser;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;


 //Adapter-Klasse, um AppUser mit Spring Security zu verwenden.

public class AppUserDetails implements UserDetails {

    private final AppUser user;

    public AppUserDetails(AppUser user) {
        this.user = user;
    }

    // Gibt das zugehörige AppUser-Objekt zurück
    public AppUser getUser() {
        return user;
    }

    // Gibt die Rollen des Benutzers zurück
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
    }

    // Gibt das Passwort des Benutzers zurück
    @Override
    public String getPassword() {
        return user.getPassword();
    }

    // Gibt den Benutzernamen zurück
    @Override
    public String getUsername() {
        return user.getEmail();   // << Login findet mit E-Mail statt
    }

    // Gibt zurück, ob das Konto abgelaufen ist (immer wahr)
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    // Gibt zurück, ob das Konto gesperrt ist (immer wahr)
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    // Gibt zurück, ob die Anmeldeinformationen abgelaufen sind (immer wahr)
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    // Gibt zurück, ob das Konto aktiviert ist (immer wahr)
    @Override
    public boolean isEnabled() {
        return true;
    }
}



