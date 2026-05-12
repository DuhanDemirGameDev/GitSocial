package com.example.gitsocial.domain.dto;

import java.time.Instant;
import java.util.UUID;

public record CommentResponse(
        UUID id,
        String content,
        Instant createdAt,
        UserDto author,
        long likeCount,
        boolean likedByCurrentUser
) {
}
