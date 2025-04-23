package com.socialapp.Zircuit.service;

import com.socialapp.Zircuit.exception.ResourceNotFoundException;
import com.socialapp.Zircuit.model.dto.response.NotificationResponse;
import com.socialapp.Zircuit.model.dto.response.UserSummaryResponse;
import com.socialapp.Zircuit.model.entity.Notification;
import com.socialapp.Zircuit.model.entity.User;
import com.socialapp.Zircuit.repository.NotificationRepository;
import com.socialapp.Zircuit.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getNotifications(String userId, boolean unreadOnly, Pageable pageable) {
        Page<Notification> notifications;
        
        if (unreadOnly) {
            notifications = notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false, pageable);
        } else {
            notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        }
        
        return notifications.map(this::mapNotificationToResponse);
    }
    
    @Transactional
    public void markNotificationAsRead(String userId, String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));
        
        // Ensure notification belongs to the user
        if (!notification.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Notification", "id", notificationId);
        }
        
        notification.setRead(true);
        notificationRepository.save(notification);
    }
    
    @Transactional
    public void markAllNotificationsAsRead(String userId) {
        notificationRepository.markAllAsRead(userId);
    }
    
    @Transactional
    public void createNotification(String userId, String actorId, String content, String referenceId, 
                                  com.socialapp.Zircuit.model.enums.NotificationType type) {
        // Validate user exists
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }
        
        // Validate actor exists if provided
        if (actorId != null && !userRepository.existsById(actorId)) {
            throw new ResourceNotFoundException("User", "id", actorId);
        }
        
        // Create notification
        Notification notification = Notification.builder()
                .id(UUID.randomUUID().toString())
                .userId(userId)
                .actorId(actorId)
                .content(content)
                .referenceId(referenceId)
                .type(type)
                .build();
        
        Notification savedNotification = notificationRepository.save(notification);
        
        // Send real-time notification via WebSocket
        NotificationResponse response = mapNotificationToResponse(savedNotification);
        messagingTemplate.convertAndSend("/topic/notifications/" + userId, response);
    }
    
    @Transactional(readOnly = true)
    public long countUnreadNotifications(String userId) {
        return notificationRepository.countUnreadNotifications(userId);
    }
    
    private NotificationResponse mapNotificationToResponse(Notification notification) {
        UserSummaryResponse actor = null;
        
        if (notification.getActorId() != null) {
            User actorUser = userRepository.findById(notification.getActorId())
                    .orElse(null);
            
            if (actorUser != null) {
                actor = UserSummaryResponse.builder()
                        .id(actorUser.getId())
                        .username(actorUser.getUsername())
                        .email(actorUser.getEmail())
                        .fullName(actorUser.getFullName())
                        .avatarUrl(actorUser.getAvatarUrl())
                        .isPublic(actorUser.isPublic())
                        .isVerified(actorUser.isVerified())
                        .build();
            }
        }
        
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .content(notification.getContent())
                .actor(actor)
                .referenceId(notification.getReferenceId())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
