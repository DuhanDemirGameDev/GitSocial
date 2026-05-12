package com.example.gitsocial.domain.dto;

import java.time.Instant;
import java.util.UUID;

public record PostResponse(
        UUID id,
        String content,
        String mediaUrl,
        double popularityScore,
        Instant createdAt,
        UserDto author,
        UUID communityId,
        String communityName,
        long likeCount,
        long commentCount,
        boolean likedByCurrentUser
) {
}
