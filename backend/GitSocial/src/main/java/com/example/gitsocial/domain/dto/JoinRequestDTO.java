package com.example.gitsocial.domain.dto;

import java.time.Instant;
import java.util.UUID;

public record JoinRequestDTO(
        UUID requestId,
        UUID userId,
        String userFirstName,
        String userLastName,
        Instant createdAt
) {}