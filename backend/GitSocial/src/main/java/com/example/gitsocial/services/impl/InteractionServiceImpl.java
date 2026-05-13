package com.example.gitsocial.services.impl;

import com.example.gitsocial.domain.dto.CommentRequest;
import com.example.gitsocial.domain.dto.CommentResponse;
import com.example.gitsocial.domain.dto.LikeResponse;
import com.example.gitsocial.domain.dto.UserDto;
import com.example.gitsocial.domain.entities.Comment;
import com.example.gitsocial.domain.entities.CommentLike;
import com.example.gitsocial.domain.entities.Like;
import com.example.gitsocial.domain.entities.Post;
import com.example.gitsocial.domain.entities.User;
import com.example.gitsocial.exception.ResourceNotFoundException;
import com.example.gitsocial.repositories.CommentLikeRepository;
import com.example.gitsocial.repositories.CommentRepository;
import com.example.gitsocial.repositories.LikeRepository;
import com.example.gitsocial.repositories.PostRepository;
import com.example.gitsocial.repositories.UserRepository;
import com.example.gitsocial.services.InteractionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InteractionServiceImpl implements InteractionService {

    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final CommentLikeRepository commentLikeRepository;
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
    public LikeResponse toggleCommentLike(UUID postId, UUID commentId, UUID userId) {
        Comment comment = findCommentForPost(postId, commentId);
        User user = findUser(userId);

        return commentLikeRepository.findByCommentIdAndUserId(commentId, userId)
                .map(existingLike -> {
                    commentLikeRepository.delete(existingLike);
                    commentLikeRepository.flush();
                    return new LikeResponse(commentLikeRepository.countByCommentId(commentId), false);
                })
                .orElseGet(() -> {
                    CommentLike like = CommentLike.builder()
                            .comment(comment)
                            .user(user)
                            .createdAt(Instant.now())
                            .build();

                    commentLikeRepository.saveAndFlush(like);
                    return new LikeResponse(commentLikeRepository.countByCommentId(commentId), true);
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

        return toResponse(commentRepository.save(comment), userId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CommentResponse> getCommentsByPost(UUID postId, Pageable pageable, UUID currentUserId) {
        ensurePostExists(postId);
        return commentRepository.findByPostIdOrderByCreatedAtAsc(postId, pageable)
                .map(comment -> toResponse(comment, currentUserId));
    }

    @Override
    @Transactional
    public void deleteComment(UUID postId, UUID commentId, UUID currentUserId) {
        Comment comment = findCommentForPost(postId, commentId);
        UUID commentAuthorId = comment.getUser().getId();
        UUID postAuthorId = comment.getPost().getAuthor().getId();

        if (!currentUserId.equals(commentAuthorId) && !currentUserId.equals(postAuthorId)) {
            throw new AccessDeniedException("Only the comment author or post author can delete this comment.");
        }

        commentRepository.delete(comment);
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

    private Comment findCommentForPost(UUID postId, UUID commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found."));

        if (!comment.getPost().getId().equals(postId)) {
            throw new ResourceNotFoundException("Comment not found for this post.");
        }

        return comment;
    }

    private User findUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    private CommentResponse toResponse(Comment comment, UUID currentUserId) {
        User author = comment.getUser();
        UserDto authorDto = new UserDto(
                author.getId(),
                author.getFirstName(),
                author.getLastName(),
                author.getEmail(),
                author.getProfilePictureUrl()
        );
        long likeCount = commentLikeRepository.countByCommentId(comment.getId());
        boolean likedByCurrentUser = currentUserId != null
                && commentLikeRepository.existsByCommentIdAndUserId(comment.getId(), currentUserId);

        boolean isAuthor = currentUserId != null && currentUserId.equals(author.getId());

        return new CommentResponse(
                comment.getId(),
                comment.getContent(),
                comment.getCreatedAt(),
                authorDto,
                likeCount,
                likedByCurrentUser,
                isAuthor
        );
    }
}
