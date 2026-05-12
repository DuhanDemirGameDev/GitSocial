package com.example.gitsocial.controller;

import com.example.gitsocial.domain.dto.CommunityRequest;
import com.example.gitsocial.domain.dto.CommunityResponse;
import com.example.gitsocial.domain.entities.User;
import com.example.gitsocial.exception.UnauthorizedException;
import com.example.gitsocial.services.CommunityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/communities")
@RequiredArgsConstructor
@Validated
public class CommunityController {

    private final CommunityService communityService;

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
}
