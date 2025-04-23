package com.socialapp.Zircuit.service;

import com.socialapp.Zircuit.exception.BadRequestException;
import com.socialapp.Zircuit.exception.ResourceNotFoundException;
import com.socialapp.Zircuit.exception.UnauthorizedException;
import com.socialapp.Zircuit.model.dto.request.ProfileUpdateRequest;
import com.socialapp.Zircuit.model.dto.request.SettingsUpdateRequest;
import com.socialapp.Zircuit.model.dto.response.ProfileResponse;
import com.socialapp.Zircuit.model.dto.response.UserSummaryResponse;
import com.socialapp.Zircuit.model.entity.User;
import com.socialapp.Zircuit.repository.FollowRepository;
import com.socialapp.Zircuit.repository.UserRepository;
import com.socialapp.Zircuit.security.JwtTokenProvider;
import com.socialapp.Zircuit.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
//import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final EmailService emailService;
    private final JwtTokenProvider tokenProvider; 

    @Value("${app.file.upload-dir}")
    private String uploadDir;

    @Transactional(readOnly = true)
    public ProfileResponse getUserProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        // Get follower and following counts
        long followerCount = followRepository.countFollowersByUserId(userId);
        long followingCount = followRepository.countFollowingByUserId(userId);
        
        // Check if current user is following the requested user
        boolean isFollowing = false;
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && 
                !authentication.getPrincipal().equals("anonymousUser")) {
            UserPrincipal currentUser = (UserPrincipal) authentication.getPrincipal();
            if (!currentUser.getId().equals(userId)) {
                isFollowing = followRepository.existsByIdFollowerIdAndIdFollowedId(currentUser.getId(), userId);
            }
        }
        
        return ProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .bio(user.getBio())
                .avatarUrl(user.getAvatarUrl())
                .websiteUrl(user.getWebsiteUrl())
                .location(user.getLocation())
                .isPublic(user.isPublic())
                .isVerified(user.isVerified())
                .followerCount(followerCount)
                .followingCount(followingCount)
                .isFollowing(isFollowing)
                .build();
    }
    
    @Transactional
    public ProfileResponse updateUserProfile(String userId, ProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        // Check if username update is requested and valid
        if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
            // Check if username is taken
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new BadRequestException("Username is already taken");
            }
            user.setUsername(request.getUsername());
        }
        
        // Update other fields if provided
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        
        if (request.getWebsiteUrl() != null) {
            user.setWebsiteUrl(request.getWebsiteUrl());
        }
        
        if (request.getLocation() != null) {
            user.setLocation(request.getLocation());
        }
        
        User updatedUser = userRepository.save(user);
        
        return getUserProfile(updatedUser.getId());
    }
    
    @Transactional
    public UserSummaryResponse updateUserSettings(String userId, SettingsUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        // Update visibility setting if provided
        if (request.getIsPublic() != null) {
            user.setPublic(request.getIsPublic());
        }
        
        // Update email if provided and valid
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            // Check if email is already taken
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email is already registered");
            }
            
            // Update the email
            user.setEmail(request.getEmail());
            user.setVerified(false);
            
            // Save the user first to ensure it has an ID if it's a new user
            User updatedUser = userRepository.save(user);
            
            // Generate verification token and send email
            try {
                // Create a verification token
                String token = tokenProvider.generateEmailVerificationToken(updatedUser.getId());
                
                // Send verification email
                emailService.sendVerificationEmail(
                    request.getEmail(),
                    token,
                    updatedUser.getFullName() != null ? updatedUser.getFullName() : updatedUser.getUsername()
                );
                
                log.info("Verification email sent to: {}", request.getEmail());
                
                return UserSummaryResponse.builder()
                        .id(updatedUser.getId())
                        .username(updatedUser.getUsername())
                        .email(updatedUser.getEmail())
                        .fullName(updatedUser.getFullName())
                        .avatarUrl(updatedUser.getAvatarUrl())
                        .isPublic(updatedUser.isPublic())
                        .isVerified(updatedUser.isVerified())
                        .build();
            } catch (Exception e) {
                log.error("Failed to send verification email: {}", e.getMessage());
                throw new BadRequestException("Failed to send verification email. Please try again later.");
            }
        }
        
        User updatedUser = userRepository.save(user);
        
        return UserSummaryResponse.builder()
                .id(updatedUser.getId())
                .username(updatedUser.getUsername())
                .email(updatedUser.getEmail())
                .fullName(updatedUser.getFullName())
                .avatarUrl(updatedUser.getAvatarUrl())
                .isPublic(updatedUser.isPublic())
                .isVerified(updatedUser.isVerified())
                .build();
    }
    
    @Transactional
    public String uploadAvatar(String userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        // Validate file
        if (file.isEmpty()) {
            throw new BadRequestException("File cannot be empty");
        }
        
        // Check file size (max 5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BadRequestException("File size exceeds maximum limit (5MB)");
        }
        
        // Check file type (only images)
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.startsWith("image/"))) {
            throw new BadRequestException("Only image files are allowed");
        }
        
        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // Generate a unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null ? 
                    originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
            String filename = UUID.randomUUID() + extension;
            
            // Save the file
            Path targetLocation = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            // Update user's avatar URL
            String avatarUrl = "/uploads/" + filename;
            user.setAvatarUrl(avatarUrl);
            userRepository.save(user);
            
            return avatarUrl;
        } catch (IOException ex) {
            throw new BadRequestException("Could not upload file: " + ex.getMessage());
        }
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
            return true; // Already verified
        }
        
        user.setVerified(true);
        userRepository.save(user);
        
        return true;
    } catch (Exception e) {
        log.error("Error verifying email", e);
        return false;
    }
}
    
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || 
                authentication.getPrincipal().equals("anonymousUser")) {
            throw new UnauthorizedException("Not authenticated");
        }
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        return userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userPrincipal.getId()));
    }
}
