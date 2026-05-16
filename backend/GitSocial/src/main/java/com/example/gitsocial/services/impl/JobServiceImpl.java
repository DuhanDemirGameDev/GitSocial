package com.example.gitsocial.services.impl;

import com.example.gitsocial.domain.dto.JobDTO;
import com.example.gitsocial.domain.dto.JobFilterDTO;
import com.example.gitsocial.domain.dto.JobResponse;
import com.example.gitsocial.domain.dto.UserDto;
import com.example.gitsocial.domain.entities.Job;
import com.example.gitsocial.domain.entities.User;
import com.example.gitsocial.domain.entities.WorkMode;
import com.example.gitsocial.repositories.JobRepository;
import com.example.gitsocial.repositories.specifications.JobSpecifications;
import com.example.gitsocial.services.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;

    @Override
    @Transactional
    public JobResponse createJob(JobDTO request, User createdBy) {
        Job job = Job.builder()
                .title(normalizeRequiredText(request.title(), "Job title"))
                .salaryRange(validateSalary(request.salaryRange()))
                .location(normalizeRequiredText(request.location(), "Location"))
                .workMode(parseWorkMode(request.workMode()))
                .createdAt(Instant.now())
                .createdBy(createdBy)
                .build();

        return toResponse(jobRepository.save(job));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobResponse> filterJobs(JobFilterDTO filter, Pageable pageable) {
        validateFilter(filter);
        return jobRepository.findAll(JobSpecifications.withFilters(filter), pageable)
                .map(this::toResponse);
    }

    private void validateFilter(JobFilterDTO filter) {
        if (filter.minSalary() != null && filter.minSalary() < 0) {
            throw new IllegalArgumentException("Minimum salary cannot be negative.");
        }

        if (filter.maxSalary() != null && filter.maxSalary() < 0) {
            throw new IllegalArgumentException("Maximum salary cannot be negative.");
        }

        if (filter.minSalary() != null && filter.maxSalary() != null
                && filter.minSalary() > filter.maxSalary()) {
            throw new IllegalArgumentException("Minimum salary cannot be greater than maximum salary.");
        }
    }

    private Integer validateSalary(Integer salaryRange) {
        if (salaryRange == null) {
            throw new IllegalArgumentException("Salary range is required.");
        }

        if (salaryRange < 0) {
            throw new IllegalArgumentException("Salary range cannot be negative.");
        }

        return salaryRange;
    }

    private String normalizeRequiredText(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " cannot be blank.");
        }

        return value.trim();
    }

    private WorkMode parseWorkMode(String workMode) {
        if (workMode == null || workMode.isBlank()) {
            throw new IllegalArgumentException("Work mode is required.");
        }

        try {
            return WorkMode.valueOf(workMode.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Work mode must be REMOTE, HYBRID, or ONSITE.");
        }
    }

    private JobResponse toResponse(Job job) {
        User createdBy = job.getCreatedBy();
        UserDto createdByDto = new UserDto(
                createdBy.getId(),
                createdBy.getFirstName(),
                createdBy.getLastName(),
                createdBy.getEmail(),
                createdBy.getProfilePictureUrl(),
                createdBy.getBio()
        );

        return new JobResponse(
                job.getId(),
                job.getTitle(),
                job.getSalaryRange(),
                job.getLocation(),
                job.getWorkMode(),
                job.getCreatedAt(),
                createdByDto
        );
    }
}
