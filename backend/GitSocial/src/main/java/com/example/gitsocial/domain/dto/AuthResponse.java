package com.example.gitsocial.domain.dto;

public record AuthResponse(
        UserDto user,
        String accessToken
) {
}
