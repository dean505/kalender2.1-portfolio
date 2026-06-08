package com.example.kalender.config;

import com.example.kalender.entity.AppUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.List;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String jwtSecret;

    // Generiert den Signing Key aus dem Secret
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    // Erzeugt ein JWT-Token für den gegebenen Benutzer
    public String generateToken(AppUser user) {
        return Jwts.builder()
                .setSubject(user.getEmail()) // Setzt den Benutzer-Email als Subjekt
                .claim("role", "ROLE_" + user.getRole().name()) // Setzt die Rolle als Claim
                .setIssuedAt(new Date()) // Setzt das Erstellungsdatum
                .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // Setzt das Ablaufdatum auf 24h später
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) // Signiert das Token mit dem Secret
                .compact(); // Gibt das JWT als String zurück
    }

    // Extrahiert den Benutzernamen aus dem JWT-Token
    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject(); // Holt das Subjekt des Tokens (Benutzername)
    }

    // Extrahiert alle Claims aus dem JWT-Token
    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey()) // Verwendet das Secret zum Verifizieren
                .build()
                .parseClaimsJws(token) // Parst das JWT
                .getBody(); // Gibt die Claims zurück
    }

    // Extrahiert die Rollen des Benutzers aus dem JWT-Token
    public List<String> extractAuthorities(String token) {
        Claims claims = extractAllClaims(token); // Holt alle Claims
        String role = (String) claims.get("role"); // Holt die Rolle aus den Claims

        // Falls "ROLE_" nicht schon in der Rolle enthalten ist, wird es hinzugefügt
        if (!role.startsWith("ROLE_")) {
            role = "ROLE_" + role;
        }

        return List.of(role); // Gibt die Rolle als Liste zurück
    }
}



