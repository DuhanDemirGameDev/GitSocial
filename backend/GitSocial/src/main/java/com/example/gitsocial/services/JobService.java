package com.example.gitsocial.services;

import com.example.gitsocial.domain.dto.JobDTO;
import com.example.gitsocial.domain.dto.JobFilterDTO;
import com.example.gitsocial.domain.dto.JobResponse;
import com.example.gitsocial.domain.entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface JobService {

    JobResponse createJob(JobDTO request, User createdBy);

    Page<JobResponse> filterJobs(JobFilterDTO filter, Pageable pageable);
}
