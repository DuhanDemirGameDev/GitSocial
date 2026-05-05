package com.example.gitsocial.domain.dto;

import com.example.gitsocial.domain.entities.WorkMode;

import java.time.Instant;
import java.util.UUID;

public record JobResponse(
        UUID id,
        String title,
        Integer salaryRange,
        String location,
        WorkMode workMode,
        Instant createdAt,
        UserDto createdBy
) {
}
