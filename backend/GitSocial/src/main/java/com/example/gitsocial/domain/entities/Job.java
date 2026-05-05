package com.example.gitsocial.domain.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "jobs",
        indexes = {
                @Index(name = "idx_jobs_salary_range", columnList = "salary_range"),
                @Index(name = "idx_jobs_location", columnList = "location"),
                @Index(name = "idx_jobs_work_mode", columnList = "work_mode"),
                @Index(name = "idx_jobs_created_at", columnList = "created_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "job_id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "salary_range", nullable = false)
    private Integer salaryRange;

    @Column(name = "location", nullable = false, length = 120)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "work_mode", nullable = false, length = 20)
    private WorkMode workMode;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;
}
