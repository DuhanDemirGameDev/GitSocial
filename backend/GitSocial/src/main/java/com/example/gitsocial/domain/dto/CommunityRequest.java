package com.example.gitsocial.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CommunityRequest(
        @NotBlank(message = "Community name cannot be blank.")
        @Size(max = 120, message = "Community name can be at most 120 characters.")
        String name,

        @Size(max = 1000, message = "Community description can be at most 1000 characters.")
        String description
) {
}
