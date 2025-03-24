package com.socialapp.Zircuit.service;

import com.socialapp.Zircuit.exception.BadRequestException;
import com.socialapp.Zircuit.exception.ResourceNotFoundException;
import com.socialapp.Zircuit.exception.UnauthorizedException;
import com.socialapp.Zircuit.model.dto.response.ConversationResponse;
import com.socialapp.Zircuit.model.dto.response.MessageResponse;
import com.socialapp.Zircuit.model.dto.response.UserSummaryResponse;
import com.socialapp.Zircuit.model.entity.Message;
import com.socialapp.Zircuit.model.entity.Notification;
import com.socialapp.Zircuit.model.entity.User;
import com.socialapp.Zircuit.model.entity.UserSettings;
import com.socialapp.Zircuit.model.enums.MessagePermission;
import com.socialapp.Zircuit.model.enums.NotificationType;
import com.socialapp.Zircuit.repository.FollowRepository;
import com.socialapp.Zircuit.repository.MessageRepository;
import com.socialapp.Zircuit.repository.NotificationRepository;
import com.socialapp.Zircuit.repository.UserRepository;
import com.socialapp.Zircuit.repository.UserSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageService {
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final FollowRepository followRepository;
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public MessageResponse sendMessage(String senderId, String receiverId, String content) {
        // Check if users exist
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", senderId));
        
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", receiverId));
        
        // Check if sender is trying to message themselves
        if (senderId.equals(receiverId)) {
            throw new BadRequestException("You cannot send a message to yourself");
        }
        
        // Check receiver's message permission settings
        UserSettings receiverSettings = userSettingsRepository.findByUserId(receiverId)
                .orElseGet(() -> {
                    // Create default settings if not exists
                    UserSettings settings = UserSettings.builder()
                            .userId(receiverId)
                            .allowMessagesFrom(MessagePermission.ALL)
                            .build();
                    return userSettingsRepository.save(settings);
                });
        
        // Check if sender is allowed to send message based on receiver's settings
        if (receiverSettings.getAllowMessagesFrom() == MessagePermission.NONE) {
            throw new UnauthorizedException("This user doesn't accept messages");
        } else if (receiverSettings.getAllowMessagesFrom() == MessagePermission.FOLLOWING) {
            // Check if receiver follows sender
            boolean isFollowing = followRepository.existsByIdFollowerIdAndIdFollowedId(receiverId, senderId);
            if (!isFollowing) {
                throw new UnauthorizedException("This user only accepts messages from people they follow");
            }
        }
        
        // Create message
        Message message = Message.builder()
                .id(UUID.randomUUID().toString())
                .senderId(senderId)
                .receiverId(receiverId)
                .content(content)
                .build();
        
        Message savedMessage = messageRepository.save(message);
        
        // Create notification for receiver
        Notification notification = Notification.builder()
                .id(UUID.randomUUID().toString())
                .userId(receiverId)
                .actorId(senderId)
                .type(NotificationType.MESSAGE)
                .content("New message from " + sender.getUsername())
                .referenceId(savedMessage.getId())
                .build();
        
        notificationRepository.save(notification);
        
        // Send real-time notification via WebSocket
        messagingTemplate.convertAndSend("/topic/messages/" + receiverId, mapMessageToResponse(savedMessage));
        messagingTemplate.convertAndSend("/topic/notifications/" + receiverId, notification);
        
        return mapMessageToResponse(savedMessage);
    }
    
    @Transactional(readOnly = true)
    public Page<MessageResponse> getConversation(String user1Id, String user2Id, Pageable pageable) {
        // Check if users exist
        if (!userRepository.existsById(user1Id)) {
            throw new ResourceNotFoundException("User", "id", user1Id);
        }
        
        if (!userRepository.existsById(user2Id)) {
            throw new ResourceNotFoundException("User", "id", user2Id);
        }
        
        // Get messages between the two users
        return messageRepository.findConversation(user1Id, user2Id, pageable)
                .map(this::mapMessageToResponse);
    }
    
    @Transactional
    public void markMessagesAsRead(String userId, String otherUserId) {
        Page<Message> messages = messageRepository.findConversation(userId, otherUserId, Pageable.unpaged());
        
        messages.forEach(message -> {
            if (message.getReceiverId().equals(userId) && !message.isRead()) {
                message.setRead(true);
                messageRepository.save(message);
            }
        });
    }
    
    @Transactional
    public void deleteMessage(String userId, String messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message", "id", messageId));
        
        // Check if user is sender or receiver
        if (message.getSenderId().equals(userId)) {
            message.setDeletedBySender(true);
        } else if (message.getReceiverId().equals(userId)) {
            message.setDeletedByReceiver(true);
        } else {
            throw new UnauthorizedException("You are not authorized to delete this message");
        }
        
        // If both sender and receiver have deleted, we could physically delete the message
        if (message.isDeletedBySender() && message.isDeletedByReceiver()) {
            messageRepository.delete(message);
        } else {
            messageRepository.save(message);
        }
    }
    
    @Transactional(readOnly = true)
    public Page<ConversationResponse> getConversations(String userId, Pageable pageable) {
        // Get conversation partners
        List<Object[]> conversations = messageRepository.findConversationPartners(userId, pageable);
        
        List<ConversationResponse> conversationResponses = new ArrayList<>();
        
        for (Object[] conversation : conversations) {
            String otherUserId = (String) conversation[0];
            
            // Get user details
            User otherUser = userRepository.findById(otherUserId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", otherUserId));
            
            // Get latest message
            Page<Message> messages = messageRepository.findConversation(userId, otherUserId, Pageable.ofSize(1));
            Message latestMessage = messages.getContent().isEmpty() ? null : messages.getContent().get(0);
            
            // Get unread count
            long unreadCount = messageRepository.countUnreadMessagesFromUser(userId, otherUserId);
            
            UserSummaryResponse userSummary = UserSummaryResponse.builder()
                    .id(otherUser.getId())
                    .username(otherUser.getUsername())
                    .email(otherUser.getEmail())
                    .fullName(otherUser.getFullName())
                    .avatarUrl(otherUser.getAvatarUrl())
                    .isPublic(otherUser.isPublic())
                    .isVerified(otherUser.isVerified())
                    .build();
            
            ConversationResponse conversationResponse = ConversationResponse.builder()
                    .user(userSummary)
                    .latestMessage(latestMessage != null ? mapMessageToResponse(latestMessage) : null)
                    .unreadCount(unreadCount)
                    .lastActivity(latestMessage != null ? latestMessage.getSentAt() : null)
                    .build();
            
            conversationResponses.add(conversationResponse);
        }
        
        return new PageImpl<>(conversationResponses);
    }
    
    @Transactional
    public void updateMessageSettings(String userId, MessagePermission allowMessagesFrom) {
        UserSettings userSettings = userSettingsRepository.findByUserId(userId)
                .orElseGet(() -> {
                    // Create default settings if not exists
                    UserSettings settings = UserSettings.builder()
                            .userId(userId)
                            .allowMessagesFrom(MessagePermission.ALL)
                            .build();
                    return userSettingsRepository.save(settings);
                });
        
        userSettings.setAllowMessagesFrom(allowMessagesFrom);
        userSettingsRepository.save(userSettings);
    }
    
    @Transactional(readOnly = true)
    public MessagePermission getMessageSettings(String userId) {
        return userSettingsRepository.findByUserId(userId)
                .map(UserSettings::getAllowMessagesFrom)
                .orElse(MessagePermission.ALL);
    }
    
    @Transactional(readOnly = true)
    public long countUnreadMessages(String userId) {
        return messageRepository.countUnreadMessages(userId);
    }
    
    private MessageResponse mapMessageToResponse(Message message) {
        return MessageResponse.builder()
                .id(message.getId())
                .senderId(message.getSenderId())
                .receiverId(message.getReceiverId())
                .content(message.getContent())
                .isRead(message.isRead())
                .sentAt(message.getSentAt())
                .build();
    }
}
