package com.example.kalender.config;

import com.example.kalender.entity.AppUser;
import com.example.kalender.entity.Role;
import com.example.kalender.repository.AppUserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import javax.annotation.PostConstruct;
import java.util.Optional;

@Configuration
public class AdminUserInitializer {

    private final AppUserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final boolean seedEnabled;
    private final String adminName;
    private final String adminEmail;
    private final String adminPhone;
    private final String adminPassword;

    public AdminUserInitializer(
            AppUserRepository userRepository,
            BCryptPasswordEncoder passwordEncoder,
            @Value("${app.admin.seed.enabled:false}") boolean seedEnabled,
            @Value("${app.admin.seed.name:admin}") String adminName,
            @Value("${app.admin.seed.email:}") String adminEmail,
            @Value("${app.admin.seed.phone:}") String adminPhone,
            @Value("${app.admin.seed.password:}") String adminPassword
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.seedEnabled = seedEnabled;
        this.adminName = adminName;
        this.adminEmail = adminEmail;
        this.adminPhone = adminPhone;
        this.adminPassword = adminPassword;
    }

    @PostConstruct
    public void createAdminUserIfNotExist() {
        if (!seedEnabled) {
            return;
        }

        if (adminEmail.isBlank() || adminPassword.isBlank()) {
            throw new IllegalStateException("Admin seed is enabled, but email or password is missing.");
        }

        Optional<AppUser> existingAdmin = userRepository.findFirstByRole(Role.ADMIN);

        if (existingAdmin.isPresent()) {
            System.out.println("Admin user already exists.");
            return;
        }

        AppUser admin = new AppUser();
        admin.setName(adminName);
        admin.setEmail(adminEmail);
        admin.setTelefonnummer(adminPhone);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setRole(Role.ADMIN);

        userRepository.save(admin);
        System.out.println("Admin user created.");
    }
}
