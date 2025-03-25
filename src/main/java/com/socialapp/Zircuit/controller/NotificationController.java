package com.socialapp.Zircuit.controller;

import com.socialapp.Zircuit.model.dto.response.NotificationResponse;
import com.socialapp.Zircuit.security.UserPrincipal;
import com.socialapp.Zircuit.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<NotificationResponse>> getNotifications(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = "false") boolean unreadOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<NotificationResponse> notifications = notificationService.getNotifications(
                currentUser.getId(), unreadOnly, pageable);
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/{notificationID}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Boolean>> markNotificationAsRead(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable String notificationID) {
        notificationService.markNotificationAsRead(currentUser.getId(), notificationID);
        
        Map<String, Boolean> response = new HashMap<>();
        response.put("success", true);
        
        return ResponseEntity.ok(response);
    }

    @PutMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Boolean>> markAllNotificationsAsRead(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        notificationService.markAllNotificationsAsRead(currentUser.getId());
        
        Map<String, Boolean> response = new HashMap<>();
        response.put("success", true);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public Map<String, Long> getUnreadNotificationCount(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        long count = notificationService.countUnreadNotifications(currentUser.getId());
        
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        
        return response;
    }
}
