package com.socialapp.Zircuit.controller;

import com.socialapp.Zircuit.model.dto.request.MessageRequest;
import com.socialapp.Zircuit.model.dto.request.MessageSettingsRequest;
import com.socialapp.Zircuit.model.dto.response.ConversationResponse;
import com.socialapp.Zircuit.model.dto.response.MessageResponse;
import com.socialapp.Zircuit.model.enums.MessagePermission;
import com.socialapp.Zircuit.security.UserPrincipal;
import com.socialapp.Zircuit.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/messages")
@RequiredArgsConstructor
public class MessageController {
    private final MessageService messageService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponse> sendMessage(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody MessageRequest request) {
        MessageResponse message = messageService.sendMessage(
                currentUser.getId(),
                request.getReceiverId(),
                request.getContent()
        );
        return ResponseEntity.ok(message);
    }

    @GetMapping("/conversations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ConversationResponse>> getConversations(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ConversationResponse> conversations = messageService.getConversations(currentUser.getId(), pageable);
        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/{userID}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<MessageResponse>> getConversation(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable String userID,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "sentAt"));
        Page<MessageResponse> messages = messageService.getConversation(currentUser.getId(), userID, pageable);
        
        // Mark messages as read
        messageService.markMessagesAsRead(currentUser.getId(), userID);
        
        return ResponseEntity.ok(messages);
    }

    @DeleteMapping("/{messageID}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Boolean>> deleteMessage(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable String messageID) {
        messageService.deleteMessage(currentUser.getId(), messageID);
        
        Map<String, Boolean> response = new HashMap<>();
        response.put("success", true);
        
        return ResponseEntity.ok(response);
    }

    @PutMapping("/settings")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> updateMessageSettings(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody MessageSettingsRequest request) {
        messageService.updateMessageSettings(currentUser.getId(), request.getAllowMessagesFrom());
        
        Map<String, String> response = new HashMap<>();
        response.put("allowMessagesFrom", request.getAllowMessagesFrom().name());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/settings")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> getMessageSettings(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        MessagePermission allowMessagesFrom = messageService.getMessageSettings(currentUser.getId());
        
        Map<String, String> response = new HashMap<>();
        response.put("allowMessagesFrom", allowMessagesFrom.name());
        
        return ResponseEntity.ok(response);
    }
    
    @MessageMapping("/send/{receiverId}")
    public void handleWebSocketMessage(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @DestinationVariable String receiverId,
            @Payload String content) {
        messageService.sendMessage(currentUser.getId(), receiverId, content);
    }
}
