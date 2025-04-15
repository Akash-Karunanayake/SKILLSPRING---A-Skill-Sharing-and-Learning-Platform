package com.socialapp.Zircuit.controller;

import com.socialapp.Zircuit.model.dto.request.ProfileUpdateRequest;
import com.socialapp.Zircuit.model.dto.request.SettingsUpdateRequest;
import com.socialapp.Zircuit.model.dto.response.ProfileResponse;
import com.socialapp.Zircuit.model.dto.response.UserSummaryResponse;
import com.socialapp.Zircuit.security.UserPrincipal;
import com.socialapp.Zircuit.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/{userID}/profile")
    public ResponseEntity<ProfileResponse> getUserProfile(@PathVariable String userID) {
        ProfileResponse profile = userService.getUserProfile(userID);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProfileResponse> updateProfile(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody ProfileUpdateRequest request) {
        ProfileResponse updatedProfile = userService.updateUserProfile(currentUser.getId(), request);
        return ResponseEntity.ok(updatedProfile);
    }

    @PutMapping("/me/settings")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserSummaryResponse> updateSettings(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody SettingsUpdateRequest request) {
        UserSummaryResponse updatedUser = userService.updateUserSettings(currentUser.getId(), request);
        return ResponseEntity.ok(updatedUser);
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> uploadAvatar(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam("file") MultipartFile file) {
        String avatarUrl = userService.uploadAvatar(currentUser.getId(), file);
        
        Map<String, String> response = new HashMap<>();
        response.put("avatarUrl", avatarUrl);
        
        return ResponseEntity.ok(response);
    }
}
