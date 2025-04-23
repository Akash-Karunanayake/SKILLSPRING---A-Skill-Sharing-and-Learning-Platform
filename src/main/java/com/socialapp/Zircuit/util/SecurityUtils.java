package com.socialapp.Zircuit.util;

import com.socialapp.Zircuit.exception.UnauthorizedException;
import com.socialapp.Zircuit.security.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Utility class for security-related operations
 */
public class SecurityUtils {
    private static final BCryptPasswordEncoder PASSWORD_ENCODER = new BCryptPasswordEncoder();
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    /**
     * Get the current authenticated user's ID
     * @return the current user's ID
     * @throws UnauthorizedException if no user is authenticated
     */
    public static String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated() || 
                authentication.getPrincipal().equals("anonymousUser")) {
            throw new UnauthorizedException("Not authenticated");
        }
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        return userPrincipal.getId();
    }

    /**
     * Check if the given user ID matches the current authenticated user
     * @param userId the user ID to check
     * @return true if the current user matches the given ID
     */
    public static boolean isCurrentUser(String userId) {
        try {
            return getCurrentUserId().equals(userId);
        } catch (UnauthorizedException e) {
            return false;
        }
    }

    /**
     * Generate a secure token for email verification or password reset
     * @return a random token
     */
    public static String generateSecureToken() {
        byte[] randomBytes = new byte[32];
        SECURE_RANDOM.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    /**
     * Hash a token using SHA-256
     * @param token the token to hash
     * @return the hashed token
     */
    public static String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes());
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Failed to hash token", e);
        }
    }

    /**
     * Encode a password using BCrypt
     * @param password the password to encode
     * @return the encoded password
     */
    public static String encodePassword(String password) {
        return PASSWORD_ENCODER.encode(password);
    }

    /**
     * Check if a password matches an encoded password
     * @param rawPassword the raw password
     * @param encodedPassword the encoded password
     * @return true if the passwords match
     */
    public static boolean matchesPassword(String rawPassword, String encodedPassword) {
        return PASSWORD_ENCODER.matches(rawPassword, encodedPassword);
    }
}
