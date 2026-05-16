package com.example.gitsocial.domain.dto;

import jakarta.validation.constraints.Size;

public record UpdateBioRequest(
        @Size(max = 160, message = "Biyografi en fazla 160 karakter olabilir.")
        String bio
) {}