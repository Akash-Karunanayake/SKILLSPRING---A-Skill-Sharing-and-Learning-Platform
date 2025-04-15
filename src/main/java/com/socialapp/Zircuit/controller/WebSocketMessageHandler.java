package com.socialapp.Zircuit.controller;

import com.socialapp.Zircuit.model.dto.response.MessageResponse;
import com.socialapp.Zircuit.security.UserPrincipal;
import com.socialapp.Zircuit.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketMessageHandler {
    private final MessageService messageService;

    @MessageMapping("/chat/{receiverId}")
    public void processMessage(Authentication authentication, @DestinationVariable String receiverId, @Payload String content) {
        UserPrincipal currentUser = (UserPrincipal) authentication.getPrincipal();
        log.debug("Received WebSocket message from user {} to {}: {}", currentUser.getId(), receiverId, content);
        
        // Process and save the message using the MessageService
        messageService.sendMessage(currentUser.getId(), receiverId, content);
    }
}
