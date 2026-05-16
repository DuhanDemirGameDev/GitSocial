package com.example.gitsocial.domain.dto;

import com.example.gitsocial.domain.entities.AccountType;

import java.util.UUID;

public record UserDto(
        UUID id,
        String firstName,
        String lastName,
        String email,
        String profilePictureUrl,
        String bio,
        AccountType accountType
) {}
