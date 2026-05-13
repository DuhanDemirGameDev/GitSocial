package com.example.gitsocial.domain.dto;

import com.example.gitsocial.domain.entities.CommunityRole;

import java.time.Instant;
import java.util.UUID;

public record CommunityResponse(
        UUID id,
        String name,
        String description,
        Instant createdAt,
        boolean isPublic,
        long memberCount,
        boolean joinedByCurrentUser,
        CommunityRole currentUserRole
) {
}
