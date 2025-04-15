package com.socialapp.Zircuit.service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromEmail;
    
    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Async
    public void sendEmail(String to, String subject, String templateName, Map<String, Object> templateModel) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name());

            Context context = new Context();
            context.setVariables(templateModel);
            String html = templateEngine.process(templateName, context);

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            helper.setFrom(fromEmail);

            mailSender.send(message);
            log.info("Email sent to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    public void sendVerificationEmail(String to, String token, String name) {
        String verificationUrl = frontendUrl + "/verify-email?token=" + token;
        
        Map<String, Object> templateModel = Map.of(
                "name", name,
                "verificationUrl", verificationUrl
        );
        
        sendEmail(to, "Verify Your Email Address", "email-verification", templateModel);
    }

    public void sendPasswordResetEmail(String to, String token, String name) {
        String resetUrl = frontendUrl + "/reset-password?token=" + token;
        
        Map<String, Object> templateModel = Map.of(
                "name", name,
                "resetUrl", resetUrl
        );
        
        sendEmail(to, "Reset Your Password", "password-reset", templateModel);
    }
}
