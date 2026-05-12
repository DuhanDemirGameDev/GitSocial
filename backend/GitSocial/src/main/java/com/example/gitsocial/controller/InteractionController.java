package com.example.gitsocial.controller;

import com.example.gitsocial.domain.dto.CommentRequest;
import com.example.gitsocial.domain.dto.CommentResponse;
import com.example.gitsocial.domain.dto.LikeResponse;
import com.example.gitsocial.domain.entities.User;
import com.example.gitsocial.exception.UnauthorizedException;
import com.example.gitsocial.services.InteractionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/posts/{postId}")
@RequiredArgsConstructor
@Validated
public class InteractionController {

    private static final int MAX_PAGE_SIZE = 50;

    private final InteractionService interactionService;

    @PostMapping("/likes")
    public ResponseEntity<LikeResponse> toggleLike(
            @PathVariable UUID postId,
            Authentication authentication
    ) {
        User user = currentUser(authentication);
        return ResponseEntity.ok(interactionService.toggleLike(postId, user.getId()));
    }

    @PostMapping("/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable UUID postId,
            @Valid @RequestBody CommentRequest request,
            Authentication authentication
    ) {
        User user = currentUser(authentication);
        CommentResponse response = interactionService.addComment(postId, user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/comments/{commentId}/likes")
    public ResponseEntity<LikeResponse> toggleCommentLike(
            @PathVariable UUID postId,
            @PathVariable UUID commentId,
            Authentication authentication
    ) {
        User user = currentUser(authentication);
        return ResponseEntity.ok(interactionService.toggleCommentLike(postId, commentId, user.getId()));
    }

    @GetMapping("/comments")
    public ResponseEntity<Page<CommentResponse>> getComments(
            @PathVariable UUID postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.max(1, Math.min(size, MAX_PAGE_SIZE));
        Pageable pageable = PageRequest.of(safePage, safeSize);
        return ResponseEntity.ok(interactionService.getCommentsByPost(postId, pageable, currentUser(authentication).getId()));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable UUID postId,
            @PathVariable UUID commentId,
            Authentication authentication
    ) {
        User user = currentUser(authentication);
        interactionService.deleteComment(postId, commentId, user.getId());
        return ResponseEntity.noContent().build();
    }

    private User currentUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new UnauthorizedException("Authenticated user could not be resolved.");
        }

        return user;
    }
}
