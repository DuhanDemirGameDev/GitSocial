package com.example.gitsocial.repositories;

import com.example.gitsocial.domain.entities.Community;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CommunityRepository extends JpaRepository<Community, UUID> {

    boolean existsByNameIgnoreCase(String name);

    Optional<Community> findByNameIgnoreCase(String name);
}
