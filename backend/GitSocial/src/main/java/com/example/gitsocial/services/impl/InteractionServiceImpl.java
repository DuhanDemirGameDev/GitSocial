package com.example.gitsocial.services.impl;

import com.example.gitsocial.domain.dto.CommentRequest;
import com.example.gitsocial.domain.dto.CommentResponse;
import com.example.gitsocial.domain.dto.LikeResponse;
import com.example.gitsocial.domain.dto.UserDto;
import com.example.gitsocial.domain.entities.Comment;
import com.example.gitsocial.domain.entities.Like;
import com.example.gitsocial.domain.entities.Post;
import com.example.gitsocial.domain.entities.User;
import com.example.gitsocial.exception.ResourceNotFoundException;
import com.example.gitsocial.repositories.CommentRepository;
import com.example.gitsocial.repositories.LikeRepository;
import com.example.gitsocial.repositories.PostRepository;
import com.example.gitsocial.repositories.UserRepository;
import com.example.gitsocial.services.InteractionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InteractionServiceImpl implements InteractionService {

    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public LikeResponse toggleLike(UUID postId, UUID userId) {
        ensurePostExists(postId);
        User user = findUser(userId);

        return likeRepository.findByPostIdAndUserId(postId, userId)
                .map(existingLike -> {
                    likeRepository.delete(existingLike);
                    likeRepository.flush();
                    return new LikeResponse(likeRepository.countByPostId(postId), false);
                })
                .orElseGet(() -> {
                    Post post = postRepository.getReferenceById(postId);
                    Like like = Like.builder()
                            .post(post)
                            .user(user)
                            .createdAt(Instant.now())
                            .build();

                    likeRepository.saveAndFlush(like);

                    return new LikeResponse(likeRepository.countByPostId(postId), true);
                });
    }

    @Override
    @Transactional
    public CommentResponse addComment(UUID postId, UUID userId, CommentRequest request) {
        Post post = findPost(postId);
        User user = findUser(userId);
        String content = request.content().trim();

        Comment comment = Comment.builder()
                .post(post)
                .user(user)
                .content(content)
                .createdAt(Instant.now())
                .build();

        return toResponse(commentRepository.save(comment));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CommentResponse> getCommentsByPost(UUID postId, Pageable pageable) {
        ensurePostExists(postId);
        return commentRepository.findByPostIdOrderByCreatedAtAsc(postId, pageable)
                .map(this::toResponse);
    }

    private Post findPost(UUID postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found."));
    }

    private void ensurePostExists(UUID postId) {
        if (!postRepository.existsById(postId)) {
            throw new ResourceNotFoundException("Post not found.");
        }
    }

    private User findUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    private CommentResponse toResponse(Comment comment) {
        User author = comment.getUser();
        UserDto authorDto = new UserDto(
                author.getId(),
                author.getFirstName(),
                author.getLastName(),
                author.getEmail()
        );

        return new CommentResponse(
                comment.getId(),
                comment.getContent(),
                comment.getCreatedAt(),
                authorDto
        );
    }
}
