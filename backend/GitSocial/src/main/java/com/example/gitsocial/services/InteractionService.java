package com.example.gitsocial.services;

import com.example.gitsocial.domain.dto.CommentRequest;
import com.example.gitsocial.domain.dto.CommentResponse;
import com.example.gitsocial.domain.dto.LikeResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface InteractionService {

    LikeResponse toggleLike(UUID postId, UUID userId);

    CommentResponse addComment(UUID postId, UUID userId, CommentRequest request);

    Page<CommentResponse> getCommentsByPost(UUID postId, Pageable pageable);
}
