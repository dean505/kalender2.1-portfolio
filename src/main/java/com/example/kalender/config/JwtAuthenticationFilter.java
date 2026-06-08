package com.example.kalender.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    // Überprüft das Authorization-Header und extrahiert das JWT-Token
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        // Prüft, ob der Header null oder nicht im richtigen Format ist
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response); // Wenn nicht, Filterkette fortsetzen
            return;
        }

        final String jwt = authHeader.substring(7); // Extrahiert das JWT-Token aus dem Header
        final String username = jwtService.extractUsername(jwt); // Extrahiert den Benutzernamen aus dem Token

        // Wenn der Benutzer existiert und noch nicht authentifiziert ist
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // Extrahiert die Rollen des Benutzers
            List<SimpleGrantedAuthority> authorities = extractAuthorities(jwt);

            // Debug-Ausgabe
            System.out.println("➡️ JWT Filter aktiv für: " + username);
            System.out.println("Authorities: " + authorities);

            // Setzt das Authentication-Token mit den extrahierten Rollen
            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(username, null, authorities);

            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            // Speichert die Authentifizierung im SecurityContext
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }

        filterChain.doFilter(request, response); // Filterkette fortsetzen
    }

    // Extrahiert die Rollen aus dem JWT
    private List<SimpleGrantedAuthority> extractAuthorities(String jwt) {
        try {
            List<String> roles = jwtService.extractAuthorities(jwt); // Extrahiert Rollen aus dem Token
            return roles.stream()
                    .map(role -> new SimpleGrantedAuthority(role.startsWith("ROLE_") ? role : "ROLE_" + role)) // Fügt "ROLE_" hinzu, falls nicht vorhanden
                    .collect(Collectors.toList());
        } catch (Exception e) {
            return List.of(); // Gibt eine leere Liste zurück, falls keine Rollen extrahiert werden können
        }
    }
}




