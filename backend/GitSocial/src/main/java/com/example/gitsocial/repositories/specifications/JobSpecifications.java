package com.example.gitsocial.repositories.specifications;

import com.example.gitsocial.domain.dto.JobFilterDTO;
import com.example.gitsocial.domain.entities.Job;
import com.example.gitsocial.domain.entities.WorkMode;
import org.springframework.data.jpa.domain.Specification;

import java.util.Locale;

public final class JobSpecifications {

    private JobSpecifications() {
    }

    public static Specification<Job> withFilters(JobFilterDTO filter) {
        Specification<Job> specification = Specification.unrestricted();

        if (hasText(filter.title())) {
            specification = specification.and(titleContains(filter.title()));
        }

        if (filter.minSalary() != null) {
            specification = specification.and(salaryGreaterThanOrEqual(filter.minSalary()));
        }

        if (filter.maxSalary() != null) {
            specification = specification.and(salaryLessThanOrEqual(filter.maxSalary()));
        }

        if (hasText(filter.location())) {
            specification = specification.and(locationContains(filter.location()));
        }

        if (hasText(filter.workMode())) {
            specification = specification.and(workModeEquals(parseWorkMode(filter.workMode())));
        }

        return specification;
    }

    private static Specification<Job> titleContains(String title) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.like(
                criteriaBuilder.lower(root.get("title")),
                "%" + title.toLowerCase(Locale.ROOT).trim() + "%"
        );
    }

    private static Specification<Job> salaryGreaterThanOrEqual(Integer minSalary) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.greaterThanOrEqualTo(root.get("salaryRange"), minSalary);
    }

    private static Specification<Job> salaryLessThanOrEqual(Integer maxSalary) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.lessThanOrEqualTo(root.get("salaryRange"), maxSalary);
    }

    private static Specification<Job> locationContains(String location) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.like(
                criteriaBuilder.lower(root.get("location")),
                "%" + location.toLowerCase(Locale.ROOT).trim() + "%"
        );
    }

    private static Specification<Job> workModeEquals(WorkMode workMode) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("workMode"), workMode);
    }

    private static WorkMode parseWorkMode(String workMode) {
        try {
            return WorkMode.valueOf(workMode.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Work mode must be REMOTE, HYBRID, or ONSITE.");
        }
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
