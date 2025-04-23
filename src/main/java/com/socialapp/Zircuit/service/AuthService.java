package com.socialapp.Zircuit.service;

import com.socialapp.Zircuit.exception.BadRequestException;
import com.socialapp.Zircuit.exception.ResourceNotFoundException;
import com.socialapp.Zircuit.exception.UnauthorizedException;
import com.socialapp.Zircuit.model.dto.response.AuthResponse;
import com.socialapp.Zircuit.model.dto.response.UserSummaryResponse;
import com.socialapp.Zircuit.model.entity.User;
import com.socialapp.Zircuit.model.entity.UserAuth;
import com.socialapp.Zircuit.model.entity.UserSettings;
import com.socialapp.Zircuit.model.enums.AuthProvider;
import com.socialapp.Zircuit.model.enums.MessagePermission;
import com.socialapp.Zircuit.repository.UserAuthRepository;
import com.socialapp.Zircuit.repository.UserRepository;
import com.socialapp.Zircuit.repository.UserSettingsRepository;
import com.socialapp.Zircuit.security.JwtTokenProvider;
import com.socialapp.Zircuit.security.UserPrincipal;
//import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
//import org.springframework.context.annotation.Lazy;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class AuthService {
    private final UserRepository userRepository;
    private final UserAuthRepository userAuthRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;
    private final ClientRegistrationRepository clientRegistrationRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private PasswordEncoder passwordEncoder;
    private AuthenticationManager authenticationManager;

    public AuthService(
            UserRepository userRepository,
            UserAuthRepository userAuthRepository,
            UserSettingsRepository userSettingsRepository,
            JwtTokenProvider tokenProvider,
            EmailService emailService,
            ClientRegistrationRepository clientRegistrationRepository
            ) {
        this.userRepository = userRepository;
        this.userAuthRepository = userAuthRepository;
        this.userSettingsRepository = userSettingsRepository;
        this.tokenProvider = tokenProvider;
        this.emailService = emailService;
        this.clientRegistrationRepository = clientRegistrationRepository;
    
    }

    @Autowired
    public void setAuthenticationManager(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }

    @Autowired
    public void setPasswordEncoder(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder; // Setter injection
    }

    @Value("${app.oauth2.redirectUri}")
    private String redirectUri;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${app.verification.tokenExpirationMs}")
    private long verificationTokenExpirationMs;

    @Value("${app.password-reset.tokenExpirationMs}")
    private long passwordResetTokenExpirationMs;

    @Transactional
    public AuthResponse login(String email, String password) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        String accessToken = tokenProvider.generateToken(userPrincipal.getId());
        String refreshToken = tokenProvider.generateRefreshToken(userPrincipal.getId());

        updateLastLogin(userPrincipal.getId());

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userPrincipal.getId()));

        return AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .user(mapUserToUserSummaryResponse(user))
                .build();
    }

    @Transactional
    public AuthResponse register(String username, String email, String password, String fullName) {
        if (userRepository.existsByUsername(username)) {
            throw new BadRequestException("Username is already taken");
        }

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email is already registered");
        }

        User user = User.builder()
                .id(UUID.randomUUID().toString())
                .username(username)
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .fullName(fullName)
                .isActive(true)
                .isVerified(false)
                .isPublic(false)
                .build();

        User savedUser = userRepository.save(user);

        UserSettings userSettings = UserSettings.builder()
                .userId(savedUser.getId())
                .allowMessagesFrom(MessagePermission.ALL)
                .build();

        userSettingsRepository.save(userSettings);

        sendVerificationEmail(savedUser);

        String accessToken = tokenProvider.generateToken(savedUser.getId());
        String refreshToken = tokenProvider.generateRefreshToken(savedUser.getId());

        return AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .user(mapUserToUserSummaryResponse(savedUser))
                .build();
    }

    @Transactional
    public String getOAuth2RedirectUrl(String provider) {
        try {
            // Map provider string to registration ID
            String registrationId = provider.toLowerCase();
            ClientRegistration clientRegistration = clientRegistrationRepository.findByRegistrationId(registrationId);

            if (clientRegistration == null) {
                throw new BadRequestException("Unsupported auth provider: " + provider);
            }

            String authUrl = clientRegistration.getProviderDetails().getAuthorizationUri();
            String clientId = clientRegistration.getClientId();
            String scope = String.join(" ", clientRegistration.getScopes());

            String state = generateRandomState();

            return UriComponentsBuilder.fromUriString(authUrl)
                    .queryParam("client_id", clientId)
                    .queryParam("redirect_uri", redirectUri)
                    .queryParam("scope", scope)
                    .queryParam("response_type", "code")
                    .queryParam("state", state)
                    .build()
                    .toUriString();

        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid auth provider: " + provider);
        }
    }

    private String generateRandomState() {
        return UUID.randomUUID().toString();
    }

    @Transactional
    public AuthResponse processOAuth2Callback(String provider, String code, String state) {
        try {
            String registrationId = provider.toLowerCase();
            ClientRegistration clientRegistration = clientRegistrationRepository.findByRegistrationId(registrationId);

            if (clientRegistration == null) {
                throw new BadRequestException("Unsupported auth provider: " + provider);
            }

            AuthProvider authProvider = AuthProvider.valueOf(provider.toUpperCase());

            Map<String, Object> tokenResponse = exchangeCodeForToken(authProvider, code, clientRegistration);
            String accessToken = (String) tokenResponse.get("access_token");
            String refreshToken = (String) tokenResponse.getOrDefault("refresh_token", "");
            Integer expiresIn = (Integer) tokenResponse.getOrDefault("expires_in", 3600);

            Map<String, Object> userInfo = getUserInfoFromProvider(authProvider, accessToken);
            if (userInfo == null) {
                throw new BadRequestException("Unable to retrieve user info from " + provider);
            }

            String providerUserId = userInfo.get("id").toString();
            String email = userInfo.getOrDefault("email", "").toString();
            String name = userInfo.getOrDefault("name", "").toString();

            UserAuth userAuth = userAuthRepository.findByProviderAndProviderUserId(authProvider, providerUserId)
                    .orElse(null);

            User user;

            if (userAuth == null) {
                if (!email.isEmpty() && userRepository.existsByEmail(email)) {
                    User existingUser = userRepository.findByEmail(email)
                            .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

                    userAuth = UserAuth.builder()
                            .userId(existingUser.getId())
                            .provider(authProvider)
                            .providerUserId(providerUserId)
                            .accessTokenHash(hashToken(accessToken))
                            .refreshTokenHash(refreshToken.isEmpty() ? null : hashToken(refreshToken))
                            .expiryTime(LocalDateTime.now().plusSeconds(expiresIn))
                            .build();

                    userAuthRepository.save(userAuth);

                    user = existingUser;
                } else {
                    String username = generateUniqueUsername(name.isEmpty() ? "user" : name);

                    user = User.builder()
                            .id(UUID.randomUUID().toString())
                            .username(username)
                            .email(email.isEmpty() ? null : email)
                            .fullName(name.isEmpty() ? "OAuth User" : name)
                            .isActive(true)
                            .isVerified(!email.isEmpty())
                            .isPublic(false)
                            .build();

                    user = userRepository.save(user);

                    userAuth = UserAuth.builder()
                            .userId(user.getId())
                            .provider(authProvider)
                            .providerUserId(providerUserId)
                            .accessTokenHash(hashToken(accessToken))
                            .refreshTokenHash(refreshToken.isEmpty() ? null : hashToken(refreshToken))
                            .expiryTime(LocalDateTime.now().plusSeconds(expiresIn))
                            .build();

                    userAuthRepository.save(userAuth);

                    UserSettings userSettings = UserSettings.builder()
                            .userId(user.getId())
                            .allowMessagesFrom(MessagePermission.ALL)
                            .build();

                    userSettingsRepository.save(userSettings);
                }
            } else {
                final UserAuth finalUserAuth = userAuth;
                user = userRepository.findById(finalUserAuth.getUserId())
                        .orElseThrow(() -> new ResourceNotFoundException("User", "id", finalUserAuth.getUserId()));

                userAuth.setAccessTokenHash(hashToken(accessToken));
                userAuth.setRefreshTokenHash(refreshToken.isEmpty() ? userAuth.getRefreshTokenHash() : hashToken(refreshToken));
                userAuth.setExpiryTime(LocalDateTime.now().plusSeconds(expiresIn));
                userAuthRepository.save(userAuth);

                if (user.getFullName() == null || user.getFullName().isEmpty()) {
                    user.setFullName(name.isEmpty() ? "OAuth User" : name);
                    userRepository.save(user);
                }
            }

            updateLastLogin(user.getId());

            String jwtAccessToken = tokenProvider.generateToken(user.getId());
            String jwtRefreshToken = tokenProvider.generateRefreshToken(user.getId());

            return AuthResponse.builder()
                    .token(jwtAccessToken)
                    .refreshToken(jwtRefreshToken)
                    .user(mapUserToUserSummaryResponse(user))
                    .build();

        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid auth provider: " + provider);
        } catch (Exception e) {
            log.error("Error processing OAuth2 callback", e);
            throw new BadRequestException("Failed to process OAuth2 callback: " + e.getMessage());
        }
    }

    private Map<String, Object> exchangeCodeForToken(AuthProvider provider, String code, ClientRegistration clientRegistration) {
        String tokenUrl = clientRegistration.getProviderDetails().getTokenUri();
        String clientId = clientRegistration.getClientId();
        String clientSecret = clientRegistration.getClientSecret();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Accept", "application/json");

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("code", code);
        params.add("redirect_uri", redirectUri);
        params.add("grant_type", "authorization_code");

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                tokenUrl,
                HttpMethod.POST,
                request,
                Map.class
        );
        @SuppressWarnings("unchecked")
        Map<String, Object> body = response.getBody();
        return body;
    }

    private Map<String, Object> getUserInfoFromProvider(AuthProvider provider, String accessToken) {
        String userInfoUrl;

        switch (provider) {
            case GOOGLE:
                userInfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo";
                break;
            case FACEBOOK:
                userInfoUrl = "https://graph.facebook.com/me?fields=id,name,email";
                break;
            case GITHUB:
                userInfoUrl = "https://api.github.com/user";
                break;
            default:
                throw new BadRequestException("Unsupported auth provider: " + provider);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Bearer " + accessToken);

        HttpEntity<String> request = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                userInfoUrl,
                HttpMethod.GET,
                request,
                Map.class
        );
        @SuppressWarnings("unchecked")
        Map<String, Object> userInfo = response.getBody();
        if (userInfo == null) {
            return null;
        }

        if (provider == AuthProvider.GITHUB && (!userInfo.containsKey("email") || userInfo.get("email") == null)) {
            String emailUrl = "https://api.github.com/user/emails";
            ResponseEntity<Map[]> emailResponse = restTemplate.exchange(
                    emailUrl,
                    HttpMethod.GET,
                    request,
                    Map[].class
            );

            @SuppressWarnings("unchecked")
            Map<String, Object>[] emails = emailResponse.getBody();
            if (emails != null && emails.length > 0) {
                for (Map<String, Object> emailObj : emails) {
                    if (Boolean.TRUE.equals(emailObj.get("primary"))) {
                        userInfo.put("email", emailObj.get("email"));
                        break;
                    }
                }

                if (!userInfo.containsKey("email") && emails.length > 0) {
                    userInfo.put("email", emails[0].get("email"));
                }
            }
        }

        return userInfo;
    }

    private String generateUniqueUsername(String baseName) {
        String sanitizedName = baseName.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();

        if (sanitizedName.length() < 3) {
            sanitizedName = "user" + sanitizedName;
        }

        if (sanitizedName.length() > 15) {
            sanitizedName = sanitizedName.substring(0, 15);
        }

        String username = sanitizedName;
        int attempt = 1;

        while (userRepository.existsByUsername(username)) {
            username = sanitizedName + attempt;
            attempt++;
        }

        return username;
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Failed to hash token", e);
        }
    }

    @Transactional
    public AuthResponse refreshToken(String refreshToken) {
        if (!tokenProvider.validateToken(refreshToken)) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        String userId = tokenProvider.getUserIdFromToken(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        String accessToken = tokenProvider.generateToken(userId);
        String newRefreshToken = tokenProvider.generateRefreshToken(userId);

        return AuthResponse.builder()
                .token(accessToken)
                .refreshToken(newRefreshToken)
                .user(mapUserToUserSummaryResponse(user))
                .build();
    }

    @Transactional
    public void updateLastLogin(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
    }

    private void sendVerificationEmail(User user) {
        String token = generateVerificationToken(user.getId());
        emailService.sendVerificationEmail(user.getEmail(), token, user.getFullName());
    }

    private String generateVerificationToken(String userId) {
        return tokenProvider.generateEmailVerificationToken(userId);
    }

    @Transactional
    public void sendPasswordResetEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElse(null);
        if (user != null) {
            String token = generatePasswordResetToken(user.getId());
            emailService.sendPasswordResetEmail(user.getEmail(), token, user.getFullName());
        }
    }

    private String generatePasswordResetToken(String userId) {
        return tokenProvider.generatePasswordResetToken(userId);
    }

    @Transactional
    public boolean verifyEmail(String token) {
        try {
            if (!tokenProvider.validateToken(token)) {
                return false;
            }

            String userId = tokenProvider.getUserIdFromToken(token);
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

            if (user.isVerified()) {
                return true;
            }

            user.setVerified(true);
            userRepository.save(user);

            return true;
        } catch (Exception e) {
            log.error("Error verifying email", e);
            return false;
        }
    }

    @Transactional
    public boolean resetPassword(String token, String newPassword) {
        try {
            if (!tokenProvider.validateToken(token)) {
                return false;
            }

            String userId = tokenProvider.getUserIdFromToken(token);
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

            user.setPasswordHash(passwordEncoder.encode(newPassword));
            userRepository.save(user);

            return true;
        } catch (Exception e) {
            log.error("Error resetting password", e);
            return false;
        }
    }

    private UserSummaryResponse mapUserToUserSummaryResponse(User user) {
        return UserSummaryResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .isPublic(user.isPublic())
                .isVerified(user.isVerified())
                .build();
    }
}