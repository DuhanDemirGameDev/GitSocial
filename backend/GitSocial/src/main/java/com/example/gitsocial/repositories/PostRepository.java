package com.example.gitsocial.repositories;

import com.example.gitsocial.domain.entities.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {

    Page<Post> findAllByOrderByPopularityScoreDescCreatedAtDesc(Pageable pageable);

    Page<Post> findByCommunityIdOrderByPopularityScoreDescCreatedAtDesc(UUID communityId, Pageable pageable);
}
