package com.example.gitsocial.repositories;

import com.example.gitsocial.domain.entities.CommunityJoinRequest;
import com.example.gitsocial.domain.entities.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommunityJoinRequestRepository extends JpaRepository<CommunityJoinRequest, UUID> {
    boolean existsByCommunityIdAndUserIdAndStatus(UUID communityId, UUID userId, RequestStatus status);
    List<CommunityJoinRequest> findByCommunityIdAndStatus(UUID communityId, RequestStatus status);
}