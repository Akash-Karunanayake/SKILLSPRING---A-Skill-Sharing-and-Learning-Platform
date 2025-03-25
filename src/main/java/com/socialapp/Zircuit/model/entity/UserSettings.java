package com.socialapp.Zircuit.model.entity;

import com.socialapp.Zircuit.model.enums.MessagePermission;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;

@Entity
@Table(name = "user_settings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSettings {
    @Id
    @Column(name = "user_id", length = 36)
    private String userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "allow_messages_from", nullable = false)
    private MessagePermission allowMessagesFrom = MessagePermission.ALL;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "userID", insertable = false, updatable = false)
    private User user;
}
