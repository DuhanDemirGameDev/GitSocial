package com.example.gitsocial.domain.dto;

public record AuthSessionResponse(
        AuthResponse authResponse,
        String refreshToken,
        long refreshTokenExpiresInMs
) {
}
