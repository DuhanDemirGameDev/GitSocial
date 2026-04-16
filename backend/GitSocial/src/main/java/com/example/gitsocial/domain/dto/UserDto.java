package com.example.gitsocial.domain.dto;

import java.util.UUID;

public record UserDto(
        UUID id,
        String firstName,
        String lastName,
        String email
) {}