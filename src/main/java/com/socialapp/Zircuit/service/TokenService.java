package com.socialapp.Zircuit.service;
import com.socialapp.Zircuit.exception.BadRequestException;
import com.socialapp.Zircuit.model.entity.User;
import com.socialapp.Zircuit.model.entity.VerificationToken;
import com.socialapp.Zircuit.repository.UserRepository;
import com.socialapp.Zircuit.repository.VerificationTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TokenService {
    private final VerificationTokenRepository tokenRepository;
    private final UserRepository userRepository;

    @Value("${app.token.verification.expiration-hours:24}")
    private long tokenExpirationHours;

    @Transactional
    public String createEmailVerificationToken(User user, String email) {
        // Delete any existing verification tokens for this user
        tokenRepository.deleteByUserIdAndTokenType(user.getId(), VerificationToken.TokenType.EMAIL_VERIFICATION);
        
        // Create a new token
        String tokenValue = UUID.randomUUID().toString();
        VerificationToken token = VerificationToken.builder()
                .token(tokenValue)
                .user(user)
                .email(email)
                .tokenType(VerificationToken.TokenType.EMAIL_VERIFICATION)
                .expiryDate(Instant.now().plus(tokenExpirationHours, ChronoUnit.HOURS))
                .used(false)
                .build();
        
        tokenRepository.save(token);
        return tokenValue;
    }

    @Transactional
    public boolean verifyEmail(String token) {
        VerificationToken verificationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired verification token"));
        
        // Check if token is valid
        if (verificationToken.isExpired()) {
            throw new BadRequestException("Verification token has expired");
        }
        
        if (verificationToken.isUsed()) {
            throw new BadRequestException("Verification token has already been used");
        }
        
        if (verificationToken.getTokenType() != VerificationToken.TokenType.EMAIL_VERIFICATION) {
            throw new BadRequestException("Invalid token type");
        }
        
        // Mark token as used
        verificationToken.setUsed(true);
        tokenRepository.save(verificationToken);
        
        // Update user's verified status
        User user = verificationToken.getUser();
        
        // Make sure the email still matches (user hasn't changed email again)
        if (!user.getEmail().equals(verificationToken.getEmail())) {
            throw new BadRequestException("Email address has changed since this verification was requested");
        }
        
        user.setVerified(true);
        userRepository.save(user);
        
        return true;
    }
}
