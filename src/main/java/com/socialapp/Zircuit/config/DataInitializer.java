package com.socialapp.Zircuit.config;

import com.socialapp.Zircuit.model.entity.User;
import com.socialapp.Zircuit.model.entity.UserSettings;
import com.socialapp.Zircuit.model.enums.MessagePermission;
import com.socialapp.Zircuit.repository.UserRepository;
import com.socialapp.Zircuit.repository.UserSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Initializes data when the application starts
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements ApplicationRunner {
    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        log.info("Initializing application data...");
        
        // Create admin user if not exists
        if (!userRepository.existsByUsername("admin")) {
            log.info("Creating admin user...");
            
            User adminUser = User.builder()
                    .id(UUID.randomUUID().toString())
                    .username("admin")
                    .email("admin@example.com")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .fullName("System Administrator")
                    .isActive(true)
                    .isVerified(true)
                    .isPublic(true)
                    .build();
            
            userRepository.save(adminUser);
            
            UserSettings adminSettings = UserSettings.builder()
                    .userId(adminUser.getId())
                    .allowMessagesFrom(MessagePermission.ALL)
                    .build();
            
            userSettingsRepository.save(adminSettings);
        }
        
        // Create test user if not exists
        if (!userRepository.existsByUsername("testuser")) {
            log.info("Creating test user...");
            
            User testUser = User.builder()
                    .id(UUID.randomUUID().toString())
                    .username("testuser")
                    .email("test@example.com")
                    .passwordHash(passwordEncoder.encode("test123"))
                    .fullName("Test User")
                    .bio("This is a test user account for demonstration purposes.")
                    .isActive(true)
                    .isVerified(true)
                    .isPublic(true)
                    .build();
            
            userRepository.save(testUser);
            
            UserSettings testSettings = UserSettings.builder()
                    .userId(testUser.getId())
                    .allowMessagesFrom(MessagePermission.ALL)
                    .build();
            
            userSettingsRepository.save(testSettings);
        }
        
        log.info("Data initialization completed.");
    }
}
