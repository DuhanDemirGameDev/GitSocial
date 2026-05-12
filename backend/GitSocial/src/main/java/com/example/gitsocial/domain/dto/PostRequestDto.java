package com.example.gitsocial.domain.dto;

import jakarta.validation.constraints.Size;

import java.util.UUID;

public record PostRequestDto(
        @Size(max = 1000, message = "Post content can be at most 1000 characters.")
        String content,

        @Size(max = 2048, message = "Media URL can be at most 2048 characters.")
        String mediaUrl,

        UUID communityId
) {
}
