package com.example.gitsocial.domain.dto;

import jakarta.validation.constraints.Size;

public record PostRequestDto(
        @Size(max = 1000, message = "Post content can be at most 1000 characters.")
        String content
) {
}
