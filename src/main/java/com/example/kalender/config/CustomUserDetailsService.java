package com.example.kalender.config;

import com.example.kalender.entity.AppUser;
import com.example.kalender.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final AppUserRepository repo;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        AppUser u = repo.findByEmailIgnoreCase(username)
                .orElseThrow(() -> new UsernameNotFoundException("user not found"));
        return new AppUserDetails(u); // nutzt getEmail() als Username, s. Patch oben
    }
}


