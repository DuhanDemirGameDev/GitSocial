package com.example.gitsocial.domain.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "posts",
        indexes = {
                @Index(name = "idx_posts_author_id", columnList = "author_id"),
                @Index(name = "idx_posts_community_id", columnList = "community_id"),
                @Index(name = "idx_posts_feed_order", columnList = "popularity_score, created_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "post_id", updatable = false, nullable = false)
    private UUID id;

    @Size(max = 1000)
    @Column(name = "content", length = 1000)
    private String content;

    @Column(name = "media_url", length = 2048)
    private String mediaUrl;

    @Column(name = "popularity_score", nullable = false)
    @Builder.Default
    private double popularityScore = 0.0;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id")
    private Community community;
}
