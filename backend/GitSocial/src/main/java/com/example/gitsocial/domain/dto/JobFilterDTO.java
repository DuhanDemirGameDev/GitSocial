package com.example.gitsocial.domain.dto;

public record JobFilterDTO(
        String title,
        Integer minSalary,
        Integer maxSalary,
        String location,
        String workMode
) {
}
