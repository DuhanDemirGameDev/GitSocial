package com.example.gitsocial.domain.dto;

public record RefreshTokenResponse(
        String accessToken,
        long expiresInMs
) {
}
