package com.example.gitsocial.domain.dto;

import org.springframework.data.domain.Page;
import java.util.UUID;

public record UserProfileResponse(
        UUID id,
        String firstName,
        String lastName,
        String email,
        String profilePictureUrl,
        String bio,
        long followerCount,
        long followingCount,
        boolean isFollowing, // İsteği atan kişi bu profili takip ediyor mu?
        Page<PostResponse> posts // Kullanıcının paylaştığı paginated postlar
) {}