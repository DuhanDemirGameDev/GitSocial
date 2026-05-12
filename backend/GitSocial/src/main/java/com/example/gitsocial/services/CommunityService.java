package com.example.gitsocial.services;

import com.example.gitsocial.domain.dto.CommunityRequest;
import com.example.gitsocial.domain.dto.CommunityResponse;

import java.util.List;
import java.util.UUID;

public interface CommunityService {

    CommunityResponse createCommunity(CommunityRequest request, UUID creatorId);

    List<CommunityResponse> getAllCommunities(UUID currentUserId);

    CommunityResponse getCommunity(UUID communityId, UUID currentUserId);

    CommunityResponse joinCommunity(UUID communityId, UUID userId);

    CommunityResponse leaveCommunity(UUID communityId, UUID userId);
}
