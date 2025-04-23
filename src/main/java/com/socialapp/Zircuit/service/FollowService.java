package com.socialapp.Zircuit.service;

import com.socialapp.Zircuit.exception.BadRequestException;
import com.socialapp.Zircuit.exception.ResourceNotFoundException;
import com.socialapp.Zircuit.model.dto.response.UserSummaryResponse;
import com.socialapp.Zircuit.model.entity.Follow;
import com.socialapp.Zircuit.model.entity.Notification;
import com.socialapp.Zircuit.model.entity.User;
import com.socialapp.Zircuit.model.enums.NotificationType;
import com.socialapp.Zircuit.repository.FollowRepository;
import com.socialapp.Zircuit.repository.NotificationRepository;
import com.socialapp.Zircuit.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FollowService {
    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    @Transactional
    public void followUser(String followerId, String followedId) {
        // Check if users exist
        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", followerId));
        
        User followed = userRepository.findById(followedId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", followedId));
        
        // Check if user is trying to follow themselves
        if (followerId.equals(followedId)) {
            throw new BadRequestException("You cannot follow yourself");
        }
        
        // Check if already following
        if (followRepository.existsByIdFollowerIdAndIdFollowedId(followerId, followedId)) {
            throw new BadRequestException("You are already following this user");
        }
        
        // Create follow relationship
        Follow follow = Follow.builder()
                .id(new Follow.FollowId(followerId, followedId))
                .build();
        
        followRepository.save(follow);
        
        // Create notification
        Notification notification = Notification.builder()
                .id(UUID.randomUUID().toString())
                .userId(followedId)
                .actorId(followerId)
                .type(NotificationType.FOLLOW)
                .content(follower.getUsername() + " started following you")
                .build();
        
        notificationRepository.save(notification);
    }
    
    @Transactional
    public void unfollowUser(String followerId, String followedId) {
        // Check if users exist
        if (!userRepository.existsById(followerId)) {
            throw new ResourceNotFoundException("User", "id", followerId);
        }
        
        if (!userRepository.existsById(followedId)) {
            throw new ResourceNotFoundException("User", "id", followedId);
        }
        
        // Check if user is trying to unfollow themselves
        if (followerId.equals(followedId)) {
            throw new BadRequestException("You cannot unfollow yourself");
        }
        
        // Check if follow relationship exists
        if (!followRepository.existsByIdFollowerIdAndIdFollowedId(followerId, followedId)) {
            throw new BadRequestException("You are not following this user");
        }
        
        // Delete follow relationship
        Follow.FollowId followId = new Follow.FollowId(followerId, followedId);
        followRepository.deleteById(followId);
    }
    
    @Transactional(readOnly = true)
    public Page<UserSummaryResponse> getFollowers(String userId, Pageable pageable) {
        // Check if user exists
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }
        
        // Get followers
        return followRepository.findByIdFollowedId(userId, pageable)
                .map(follow -> {
                    User follower = follow.getFollower();
                    return UserSummaryResponse.builder()
                            .id(follower.getId())
                            .username(follower.getUsername())
                            .email(follower.getEmail())
                            .fullName(follower.getFullName())
                            .avatarUrl(follower.getAvatarUrl())
                            .isPublic(follower.isPublic())
                            .isVerified(follower.isVerified())
                            .build();
                });
    }
    
    @Transactional(readOnly = true)
    public Page<UserSummaryResponse> getFollowing(String userId, Pageable pageable) {
        // Check if user exists
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }
        
        // Get following
        return followRepository.findByIdFollowerId(userId, pageable)
                .map(follow -> {
                    User followed = follow.getFollowed();
                    return UserSummaryResponse.builder()
                            .id(followed.getId())
                            .username(followed.getUsername())
                            .email(followed.getEmail())
                            .fullName(followed.getFullName())
                            .avatarUrl(followed.getAvatarUrl())
                            .isPublic(followed.isPublic())
                            .isVerified(followed.isVerified())
                            .build();
                });
    }
    
    @Transactional(readOnly = true)
    public boolean isFollowing(String followerId, String followedId) {
        return followRepository.existsByIdFollowerIdAndIdFollowedId(followerId, followedId);
    }
    
    @Transactional(readOnly = true)
    public long getFollowerCount(String userId) {
        return followRepository.countFollowersByUserId(userId);
    }
    
    @Transactional(readOnly = true)
    public long getFollowingCount(String userId) {
        return followRepository.countFollowingByUserId(userId);
    }
}
