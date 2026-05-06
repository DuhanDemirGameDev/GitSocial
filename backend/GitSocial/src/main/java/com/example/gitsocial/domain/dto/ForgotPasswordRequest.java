package com.example.gitsocial.domain.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(
        @NotBlank(message = "E-posta alanı boş bırakılamaz")
        @Email(message = "Geçerli bir e-posta adresi giriniz")
        String email
) {}