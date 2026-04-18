package com.example.gitsocial.domain.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ApiErrorResponse(
        int status,
        String error,
        String message,
        String path,
        List<String> validationErrors,
        LocalDateTime timestamp
) {
    public static ApiErrorResponse of(int status, String error, String message, String path, List<String> validationErrors) {
        return new ApiErrorResponse(status, error, message, path, validationErrors, LocalDateTime.now());
    }
}