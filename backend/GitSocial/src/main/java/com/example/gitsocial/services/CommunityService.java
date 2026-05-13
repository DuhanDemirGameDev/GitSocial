package com.example.gitsocial.services;

import com.example.gitsocial.domain.dto.CommunityRequest;
import com.example.gitsocial.domain.dto.CommunityResponse;
import com.example.gitsocial.domain.dto.JoinRequestDTO;

import java.util.List;
import java.util.UUID;

public interface CommunityService {

    CommunityResponse createCommunity(CommunityRequest request, UUID creatorId);

    List<CommunityResponse> getAllCommunities(UUID currentUserId);

    CommunityResponse getCommunity(UUID communityId, UUID currentUserId);

    CommunityResponse joinCommunity(UUID communityId, UUID userId);

    CommunityResponse leaveCommunity(UUID communityId, UUID userId);

    CommunityResponse assignRole(UUID communityId, UUID targetUserId, com.example.gitsocial.domain.entities.CommunityRole newRole, UUID requesterId);

    CommunityResponse updateJoinSetting(UUID communityId, boolean isPublic, UUID requesterId);

    List<JoinRequestDTO> getPendingRequests(UUID communityId, UUID requesterId);

    void respondToJoinRequest(UUID communityId, UUID requestId, boolean isApproved, UUID requesterId);

}
