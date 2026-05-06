package com.example.gitsocial.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @NotBlank(message = "Token eksik veya geçersiz")
        String token,

        @NotBlank(message = "Yeni şifre alanı boş bırakılamaz")
        @Size(min = 8, message = "Şifre en az 8 karakter uzunluğunda olmalıdır")
        @Pattern(regexp = "^(?=.*[A-Z])(?=.*\\d).*$", message = "Şifre en az bir büyük harf ve bir rakam içermelidir")
        String newPassword
) {}