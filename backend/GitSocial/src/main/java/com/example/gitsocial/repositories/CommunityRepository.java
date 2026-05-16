package com.example.gitsocial.repositories;

import com.example.gitsocial.domain.entities.Community;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CommunityRepository extends JpaRepository<Community, UUID> {

    boolean existsByNameIgnoreCase(String name);

    Optional<Community> findByNameIgnoreCase(String name);

    @Query("SELECT c FROM Community c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    java.util.List<com.example.gitsocial.domain.entities.Community> searchCommunities(@org.springframework.data.repository.query.Param("query") String query);
}
