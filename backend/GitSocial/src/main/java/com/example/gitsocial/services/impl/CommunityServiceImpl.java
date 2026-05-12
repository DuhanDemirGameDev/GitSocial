package com.example.gitsocial.services.impl;

import com.example.gitsocial.domain.dto.CommunityRequest;
import com.example.gitsocial.domain.dto.CommunityResponse;
import com.example.gitsocial.domain.entities.Community;
import com.example.gitsocial.domain.entities.CommunityMember;
import com.example.gitsocial.domain.entities.CommunityRole;
import com.example.gitsocial.domain.entities.User;
import com.example.gitsocial.exception.ResourceAlreadyExistsException;
import com.example.gitsocial.exception.ResourceNotFoundException;
import com.example.gitsocial.repositories.CommunityMemberRepository;
import com.example.gitsocial.repositories.CommunityRepository;
import com.example.gitsocial.repositories.UserRepository;
import com.example.gitsocial.services.CommunityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CommunityServiceImpl implements CommunityService {

    private final CommunityRepository communityRepository;
    private final CommunityMemberRepository communityMemberRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public CommunityResponse createCommunity(CommunityRequest request, UUID creatorId) {
        String name = normalizeName(request.name());

        if (communityRepository.existsByNameIgnoreCase(name)) {
            throw new ResourceAlreadyExistsException("A community with this name already exists.");
        }

        User creator = findUser(creatorId);
        Community community = Community.builder()
                .name(name)
                .description(normalizeDescription(request.description()))
                .createdAt(Instant.now())
                .build();

        Community savedCommunity = communityRepository.save(community);
        CommunityMember founder = CommunityMember.builder()
                .community(savedCommunity)
                .user(creator)
                .role(CommunityRole.FOUNDER)
                .joinedAt(Instant.now())
                .build();
        communityMemberRepository.save(founder);

        return toResponse(savedCommunity, creatorId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommunityResponse> getAllCommunities(UUID currentUserId) {
        return communityRepository.findAll().stream()
                .sorted(Comparator.comparing(Community::getCreatedAt).reversed())
                .map(community -> toResponse(community, currentUserId))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CommunityResponse getCommunity(UUID communityId, UUID currentUserId) {
        return toResponse(findCommunity(communityId), currentUserId);
    }

    @Override
    @Transactional
    public CommunityResponse joinCommunity(UUID communityId, UUID userId) {
        Community community = findCommunity(communityId);
        User user = findUser(userId);

        if (!communityMemberRepository.existsByCommunityIdAndUserId(communityId, userId)) {
            CommunityMember member = CommunityMember.builder()
                    .community(community)
                    .user(user)
                    .role(CommunityRole.MEMBER)
                    .joinedAt(Instant.now())
                    .build();
            communityMemberRepository.save(member);
        }

        return toResponse(community, userId);
    }

    @Override
    @Transactional
    public CommunityResponse leaveCommunity(UUID communityId, UUID userId) {
        Community community = findCommunity(communityId);
        CommunityMember member = communityMemberRepository.findByCommunityIdAndUserId(communityId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Community membership not found."));

        if (member.getRole() == CommunityRole.FOUNDER) {
            throw new IllegalArgumentException("The founder cannot leave the community.");
        }

        communityMemberRepository.delete(member);
        communityMemberRepository.flush();
        return toResponse(community, userId);
    }

    private Community findCommunity(UUID communityId) {
        return communityRepository.findById(communityId)
                .orElseThrow(() -> new ResourceNotFoundException("Community not found."));
    }

    private User findUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    private CommunityResponse toResponse(Community community, UUID currentUserId) {
        CommunityMember membership = currentUserId == null
                ? null
                : communityMemberRepository.findByCommunityIdAndUserId(community.getId(), currentUserId).orElse(null);

        return new CommunityResponse(
                community.getId(),
                community.getName(),
                community.getDescription(),
                community.getCreatedAt(),
                communityMemberRepository.countByCommunityId(community.getId()),
                membership != null,
                membership == null ? null : membership.getRole()
        );
    }

    private String normalizeName(String name) {
        return name.trim();
    }

    private String normalizeDescription(String description) {
        if (description == null) {
            return null;
        }

        String trimmed = description.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
