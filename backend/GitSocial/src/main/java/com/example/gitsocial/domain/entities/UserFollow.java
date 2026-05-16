package com.example.gitsocial.domain.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "user_follows",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_user_follows", columnNames = {"follower_id", "following_id"})
        },
        indexes = {
                @Index(name = "idx_user_follows_follower", columnList = "follower_id"),
                @Index(name = "idx_user_follows_following", columnList = "following_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserFollow {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "follow_id", updatable = false, nullable = false)
    private UUID id;

    // Takip eden kişi (Örn: Sen)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "follower_id", nullable = false)
    private User follower;

    // Takip edilen kişi (Örn: Zeynep)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "following_id", nullable = false)
    private User following;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}