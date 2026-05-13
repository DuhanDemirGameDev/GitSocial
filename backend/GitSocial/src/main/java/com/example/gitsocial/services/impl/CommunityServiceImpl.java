package com.example.gitsocial.services.impl;

import com.example.gitsocial.domain.dto.CommunityRequest;
import com.example.gitsocial.domain.dto.CommunityResponse;
import com.example.gitsocial.domain.dto.JoinRequestDTO;
import com.example.gitsocial.domain.entities.*;
import com.example.gitsocial.exception.ResourceAlreadyExistsException;
import com.example.gitsocial.exception.ResourceNotFoundException;
import com.example.gitsocial.exception.UnauthorizedException;
import com.example.gitsocial.repositories.CommunityJoinRequestRepository;
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
    private final CommunityJoinRequestRepository communityJoinRequestRepository;

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
                .isPublic(request.isPublic())
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

        if (communityMemberRepository.existsByCommunityIdAndUserId(communityId, userId)) {
            throw new ResourceAlreadyExistsException("Zaten bu topluluğun bir üyesisiniz.");
        }

        // KURAL KONTROLÜ: Topluluk herkese açık mı?
        if (community.isPublic()) {
            CommunityMember member = CommunityMember.builder()
                    .community(community)
                    .user(user)
                    .role(CommunityRole.MEMBER)
                    .joinedAt(Instant.now())
                    .build();
            communityMemberRepository.save(member);
        } else {
            // Gizliyse, katılım isteği oluştur!
            if (communityJoinRequestRepository.existsByCommunityIdAndUserIdAndStatus(communityId, userId, RequestStatus.PENDING)) {
                throw new ResourceAlreadyExistsException("Zaten bekleyen bir katılım isteğiniz bulunuyor.");
            }

            CommunityJoinRequest request = CommunityJoinRequest.builder()
                    .community(community)
                    .user(user)
                    .status(RequestStatus.PENDING)
                    .build();
            communityJoinRequestRepository.save(request);
        }

        return toResponse(community, userId);
    }

    // YÖNETİCİLER İÇİN YENİ METOT: Bekleyen İstekleri Getir
    @Transactional(readOnly = true)
    public List<JoinRequestDTO> getPendingRequests(UUID communityId, UUID requesterId) {
        checkAdminRights(communityId, requesterId); // Aşağıda bu yardımcı metodu da yazacağız

        return communityJoinRequestRepository.findByCommunityIdAndStatus(communityId, RequestStatus.PENDING)
                .stream()
                .map(req -> new JoinRequestDTO(
                        req.getId(), req.getUser().getId(), req.getUser().getFirstName(), req.getUser().getLastName(), req.getCreatedAt()))
                .toList();
    }

    // YÖNETİCİLER İÇİN YENİ METOT: İsteği Onayla / Reddet
    @Transactional
    public void respondToJoinRequest(UUID communityId, UUID requestId, boolean isApproved, UUID requesterId) {
        checkAdminRights(communityId, requesterId);

        CommunityJoinRequest request = communityJoinRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Katılım isteği bulunamadı."));

        if (!request.getCommunity().getId().equals(communityId)) {
            throw new IllegalArgumentException("Bu istek bu topluluğa ait değil.");
        }

        if (isApproved) {
            request.setStatus(RequestStatus.APPROVED);
            CommunityMember newMember = CommunityMember.builder()
                    .community(request.getCommunity())
                    .user(request.getUser())
                    .role(CommunityRole.MEMBER)
                    .build();
            communityMemberRepository.save(newMember);
        } else {
            request.setStatus(RequestStatus.REJECTED);
        }
        communityJoinRequestRepository.save(request);
    }

    // Yardımcı Metot: Yetki Kontrolü
    private void checkAdminRights(UUID communityId, UUID userId) {
        CommunityMember membership = communityMemberRepository.findByCommunityIdAndUserId(communityId, userId)
                .orElseThrow(() -> new UnauthorizedException("Yetkisiz erişim."));
        if (membership.getRole() == CommunityRole.MEMBER) {
            throw new UnauthorizedException("Bu işlemi yapmak için Kurucu veya Yönetici olmalısınız.");
        }
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

    @Override
    @Transactional
    public CommunityResponse assignRole(UUID communityId, UUID targetUserId, CommunityRole newRole, UUID requesterId) {
        Community community = findCommunity(communityId);

        // 1. İsteği yapan kullanıcının bu gruptaki rolünü bulalım
        CommunityMember requesterMembership = communityMemberRepository.findByCommunityIdAndUserId(communityId, requesterId)
                .orElseThrow(() -> new UnauthorizedException("Sadece topluluk üyeleri yetki ataması yapabilir."));

        // 2. KURAL: Sadece Kurucu (FOUNDER) yetki verebilir
        if (requesterMembership.getRole() != CommunityRole.FOUNDER) {
            throw new UnauthorizedException("Yalnızca topluluk kurucusu yetki ataması yapabilir.");
        }

        // 3. Yetkisi değiştirilecek hedef kullanıcıyı bulalım
        CommunityMember targetMembership = communityMemberRepository.findByCommunityIdAndUserId(communityId, targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Hedef kullanıcı bu topluluğun bir üyesi değil."));

        // 4. KURAL: Kurucunun kendi yetkisi değiştirilemez
        if (targetMembership.getRole() == CommunityRole.FOUNDER) {
            throw new IllegalArgumentException("Topluluk kurucusunun yetkisi değiştirilemez.");
        }

        // 5. Yetkiyi güncelle ve kaydet
        targetMembership.setRole(newRole);
        communityMemberRepository.save(targetMembership);

        // Topluluğun güncel durumunu döndür
        return toResponse(community, requesterId);
    }
    @Transactional
    public CommunityResponse updateJoinSetting(UUID communityId, boolean isPublic, UUID requesterId) {
        Community community = findCommunity(communityId);
        CommunityMember member = communityMemberRepository.findByCommunityIdAndUserId(communityId, requesterId)
                .orElseThrow(() -> new UnauthorizedException("Üye değilsiniz."));

        // Sadece FOUNDER veya ADMIN bu ayarı değiştirebilir [cite: 51]
        if (member.getRole() == CommunityRole.MEMBER) {
            throw new UnauthorizedException("Bu ayarı değiştirme yetkiniz yok.");
        }

        community.setPublic(isPublic);
        return toResponse(communityRepository.save(community), requesterId);
    }
}
