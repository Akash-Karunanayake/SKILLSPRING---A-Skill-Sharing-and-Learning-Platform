package com.socialapp.Zircuit.util;

import org.springframework.util.StringUtils;

import java.util.regex.Pattern;

/**
 * Utility class for common validation logic
 */
public class ValidationUtils {
    private static final Pattern EMAIL_PATTERN = 
            Pattern.compile("^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$");
    
    private static final Pattern USERNAME_PATTERN = 
            Pattern.compile("^[a-zA-Z0-9_]{3,50}$");
    
    private static final Pattern URL_PATTERN = 
            Pattern.compile("^(https?:\\/\\/)?([\\da-z\\.-]+)\\.([a-z\\.]{2,6})([\\/\\w \\.-]*)*\\/?$");

    /**
     * Validates email format
     * @param email the email to validate
     * @return true if the email is valid
     */
    public static boolean isValidEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }

    /**
     * Validates username format (alphanumeric and underscore only, 3-50 chars)
     * @param username the username to validate
     * @return true if the username is valid
     */
    public static boolean isValidUsername(String username) {
        return username != null && USERNAME_PATTERN.matcher(username).matches();
    }

    /**
     * Validates password strength
     * @param password the password to validate
     * @return true if the password is strong enough
     */
    public static boolean isValidPassword(String password) {
        if (password == null || password.length() < 8) {
            return false;
        }
        
        boolean hasUppercase = false;
        boolean hasLowercase = false;
        boolean hasDigit = false;
        
        for (char c : password.toCharArray()) {
            if (Character.isUpperCase(c)) {
                hasUppercase = true;
            } else if (Character.isLowerCase(c)) {
                hasLowercase = true;
            } else if (Character.isDigit(c)) {
                hasDigit = true;
            }
            
            if (hasUppercase && hasLowercase && hasDigit) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Validates URL format
     * @param url the URL to validate
     * @return true if the URL is valid
     */
    public static boolean isValidUrl(String url) {
        return url == null || url.isEmpty() || URL_PATTERN.matcher(url).matches();
    }

    /**
     * Sanitizes a string by removing potentially dangerous characters
     * @param input the string to sanitize
     * @return the sanitized string
     */
    public static String sanitize(String input) {
        if (!StringUtils.hasText(input)) {
            return input;
        }
        
        // Remove HTML/Script tags
        String sanitized = input.replaceAll("<[^>]*>", "");
        
        // Remove other potentially dangerous characters
        return sanitized.replaceAll("[\\\\\"'`;%]", "");
    }
}
