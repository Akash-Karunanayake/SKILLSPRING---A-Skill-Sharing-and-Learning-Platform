package com.socialapp.Zircuit.controller;

import com.socialapp.Zircuit.model.dto.response.UserSummaryResponse;
import com.socialapp.Zircuit.security.UserPrincipal;
import com.socialapp.Zircuit.service.FollowService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class FollowController {
    private final FollowService followService;

    @PostMapping("/{userID}/follow")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Boolean>> followUser(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable String userID) {
        followService.followUser(currentUser.getId(), userID);
        
        Map<String, Boolean> response = new HashMap<>();
        response.put("success", true);
        
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{userID}/follow")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Boolean>> unfollowUser(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable String userID) {
        followService.unfollowUser(currentUser.getId(), userID);
        
        Map<String, Boolean> response = new HashMap<>();
        response.put("success", true);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{userID}/followers")
    public ResponseEntity<Page<UserSummaryResponse>> getFollowers(
            @PathVariable String userID,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<UserSummaryResponse> followers = followService.getFollowers(userID, pageable);
        return ResponseEntity.ok(followers);
    }

    @GetMapping("/{userID}/following")
    public ResponseEntity<Page<UserSummaryResponse>> getFollowing(
            @PathVariable String userID,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<UserSummaryResponse> following = followService.getFollowing(userID, pageable);
        return ResponseEntity.ok(following);
    }
}
