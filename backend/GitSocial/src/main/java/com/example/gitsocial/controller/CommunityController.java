package com.example.gitsocial.controller;

import com.example.gitsocial.domain.dto.CommunityRequest;
import com.example.gitsocial.domain.dto.CommunityResponse;
import com.example.gitsocial.domain.dto.JoinRequestDTO;
import com.example.gitsocial.domain.dto.PostResponse;
import com.example.gitsocial.domain.entities.User;
import com.example.gitsocial.exception.UnauthorizedException;
import com.example.gitsocial.services.CommunityService;
import com.example.gitsocial.services.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/communities")
@RequiredArgsConstructor
@Validated
public class CommunityController {

    private static final int MAX_PAGE_SIZE = 20;

    private final CommunityService communityService;
    private final PostService postService;

    @PostMapping
    public ResponseEntity<CommunityResponse> createCommunity(
            @Valid @RequestBody CommunityRequest request,
            Authentication authentication
    ) {
        CommunityResponse response = communityService.createCommunity(request, currentUser(authentication).getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<CommunityResponse>> getAllCommunities(Authentication authentication) {
        return ResponseEntity.ok(communityService.getAllCommunities(currentUser(authentication).getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommunityResponse> getCommunity(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(communityService.getCommunity(id, currentUser(authentication).getId()));
    }

    @GetMapping("/{id}/posts")
    public ResponseEntity<Page<PostResponse>> getCommunityPosts(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.max(1, Math.min(size, MAX_PAGE_SIZE));
        Pageable pageable = PageRequest.of(safePage, safeSize);
        return ResponseEntity.ok(postService.getCommunityPosts(id, pageable, currentUser(authentication).getId()));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<CommunityResponse> joinCommunity(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(communityService.joinCommunity(id, currentUser(authentication).getId()));
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<CommunityResponse> leaveCommunity(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(communityService.leaveCommunity(id, currentUser(authentication).getId()));
    }

    private User currentUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new UnauthorizedException("Authenticated user could not be resolved.");
        }

        return user;
    }

    @PutMapping("/{id}/members/{userId}/role")
    public ResponseEntity<CommunityResponse> assignRole(
            @PathVariable UUID id,
            @PathVariable UUID userId,
            @RequestParam com.example.gitsocial.domain.entities.CommunityRole role,
            Authentication authentication
    ) {
        return ResponseEntity.ok(communityService.assignRole(id, userId, role, currentUser(authentication).getId()));
    }

    @PatchMapping("/{id}/settings")
    public ResponseEntity<CommunityResponse> updateSettings(
            @PathVariable UUID id,
            @RequestParam boolean isPublic,
            Authentication authentication
    ) {
        return ResponseEntity.ok(communityService.updateJoinSetting(id, isPublic, currentUser(authentication).getId()));
    }

    // Bekleyen İstekleri Listele
    @GetMapping("/{id}/requests")
    public ResponseEntity<List<JoinRequestDTO>> getPendingRequests(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(communityService.getPendingRequests(id, currentUser(authentication).getId()));
    }

    // İsteği Cevapla
    @PostMapping("/{id}/requests/{requestId}")
    public ResponseEntity<String> respondToRequest(
            @PathVariable UUID id,
            @PathVariable UUID requestId,
            @RequestParam boolean approve,
            Authentication authentication
    ) {
        communityService.respondToJoinRequest(id, requestId, approve, currentUser(authentication).getId());
        String message = approve ? "İstek onaylandı." : "İstek reddedildi.";
        return ResponseEntity.ok(message);
    }
}
