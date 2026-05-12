package com.example.gitsocial.domain.dto;

public record LikeResponse(
        long likeCount,
        boolean likedByCurrentUser
) {
}
