package com.example.gitsocial.controller;

import com.example.gitsocial.domain.dto.JobDTO;
import com.example.gitsocial.domain.dto.JobFilterDTO;
import com.example.gitsocial.domain.dto.JobResponse;
import com.example.gitsocial.domain.entities.User;
import com.example.gitsocial.exception.UnauthorizedException;
import com.example.gitsocial.services.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/jobs")
@RequiredArgsConstructor
public class JobController {

    private static final int MAX_PAGE_SIZE = 20;

    private final JobService jobService;

    @PostMapping
    public ResponseEntity<JobResponse> createJob(
            @Valid @RequestBody JobDTO request,
            Authentication authentication
    ) {
        JobResponse response = jobService.createJob(request, currentUser(authentication));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/filter")
    public ResponseEntity<Page<JobResponse>> filterJobs(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Integer minSalary,
            @RequestParam(required = false) Integer maxSalary,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String workMode,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        JobFilterDTO filter = new JobFilterDTO(title, minSalary, maxSalary, location, workMode);
        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                Math.max(1, Math.min(size, MAX_PAGE_SIZE)),
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        return ResponseEntity.ok(jobService.filterJobs(filter, pageable));
    }

    private User currentUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new UnauthorizedException("Authenticated user could not be resolved.");
        }

        return user;
    }
}
