package com.example.gitsocial.domain.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record JobDTO(
        @NotBlank(message = "Job title cannot be blank.")
        @Size(max = 150, message = "Job title can be at most 150 characters.")
        String title,

        @NotNull(message = "Salary range is required.")
        @Min(value = 0, message = "Salary range cannot be negative.")
        Integer salaryRange,

        @NotBlank(message = "Location cannot be blank.")
        @Size(max = 120, message = "Location can be at most 120 characters.")
        String location,

        @NotBlank(message = "Work mode is required.")
        String workMode
) {
}
