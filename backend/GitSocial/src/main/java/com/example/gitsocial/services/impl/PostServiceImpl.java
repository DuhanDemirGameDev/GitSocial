package com.example.gitsocial.services.impl;

import com.example.gitsocial.domain.dto.PostRequestDto;
import com.example.gitsocial.domain.dto.PostResponse;
import com.example.gitsocial.domain.dto.UserDto;
import com.example.gitsocial.domain.entities.Community;
import com.example.gitsocial.domain.entities.Post;
import com.example.gitsocial.domain.entities.User;
import com.example.gitsocial.exception.ResourceNotFoundException;
import com.example.gitsocial.repositories.CommentRepository;
import com.example.gitsocial.repositories.CommunityMemberRepository;
import com.example.gitsocial.repositories.CommunityRepository;
import com.example.gitsocial.repositories.LikeRepository;
import com.example.gitsocial.repositories.PostRepository;
import com.example.gitsocial.services.CloudinaryService;
import com.example.gitsocial.services.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final CloudinaryService cloudinaryService;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final CommunityRepository communityRepository;
    private final CommunityMemberRepository communityMemberRepository;

    @Value("${app.cloudinary.upload-timeout-ms}")
    private long uploadTimeoutMs;

    @Override
    @Transactional
    public PostResponse createPost(PostRequestDto request, MultipartFile media, User author) {
        String content = normalizeContent(request.content());
        boolean hasMedia = media != null && !media.isEmpty();
        String requestedMediaUrl = normalizeMediaUrl(request.mediaUrl());
        boolean hasMediaUrl = requestedMediaUrl != null;

        if ((content == null || content.isBlank()) && !hasMedia && !hasMediaUrl) {
            throw new IllegalArgumentException("Post must include text content, media, or both.");
        }

        Community community = resolveCommunity(request.communityId(), author.getId());
        String mediaUrl = hasMedia ? uploadMedia(media) : requestedMediaUrl;

        Post post = Post.builder()
                .content(content)
                .mediaUrl(mediaUrl)
                .author(author)
                .community(community)
                .createdAt(Instant.now())
                .popularityScore(calculateInitialPopularityScore(content, mediaUrl))
                .build();

        return toResponse(postRepository.save(post), author.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PostResponse> getFeed(Pageable pageable, UUID currentUserId) {
        return postRepository.findAllByOrderByPopularityScoreDescCreatedAtDesc(pageable)
                .map(post -> toResponse(post, currentUserId));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PostResponse> getCommunityPosts(UUID communityId, Pageable pageable, UUID currentUserId) {
        if (!communityRepository.existsById(communityId)) {
            throw new ResourceNotFoundException("Community not found.");
        }

        return postRepository.findByCommunityIdOrderByPopularityScoreDescCreatedAtDesc(communityId, pageable)
                .map(post -> toResponse(post, currentUserId));
    }

    private Community resolveCommunity(UUID communityId, UUID authorId) {
        if (communityId == null) {
            return null;
        }

        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new ResourceNotFoundException("Community not found."));

        if (!communityMemberRepository.existsByCommunityIdAndUserId(communityId, authorId)) {
            throw new AccessDeniedException("Only community members can post in this community.");
        }

        return community;
    }

    private String uploadMedia(MultipartFile media) {
        try {
            return cloudinaryService.uploadImageAsync(media).get(uploadTimeoutMs, TimeUnit.MILLISECONDS);
        } catch (TimeoutException ex) {
            throw new IllegalStateException("Cloudinary upload timed out.", ex);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Cloudinary upload was interrupted.", ex);
        } catch (ExecutionException ex) {
            Throwable cause = ex.getCause();
            if (cause instanceof RuntimeException runtimeException) {
                throw runtimeException;
            }
            throw new IllegalStateException("Cloudinary upload failed.", cause);
        }
    }

    private double calculateInitialPopularityScore(String content, String mediaUrl) {
        double score = 0.0;

        if (content != null && !content.isBlank()) {
            score += Math.min(content.length(), 1000) / 1000.0;
        }

        if (mediaUrl != null && !mediaUrl.isBlank()) {
            score += 1.0;
        }

        return score;
    }

    private String normalizeContent(String content) {
        if (content == null) {
            return null;
        }

        String trimmed = content.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizeMediaUrl(String mediaUrl) {
        if (mediaUrl == null) {
            return null;
        }

        String trimmed = mediaUrl.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private PostResponse toResponse(Post post, UUID currentUserId) {
        User author = post.getAuthor();
        Community community = post.getCommunity();
        UserDto authorDto = new UserDto(
                author.getId(),
                author.getFirstName(),
                author.getLastName(),
                author.getEmail()
        );
        long likeCount = likeRepository.countByPostId(post.getId());
        long commentCount = commentRepository.countByPostId(post.getId());
        boolean likedByCurrentUser = currentUserId != null
                && likeRepository.existsByPostIdAndUserId(post.getId(), currentUserId);

        return new PostResponse(
                post.getId(),
                post.getContent(),
                post.getMediaUrl(),
                post.getPopularityScore(),
                post.getCreatedAt(),
                authorDto,
                community == null ? null : community.getId(),
                community == null ? null : community.getName(),
                likeCount,
                commentCount,
                likedByCurrentUser
        );
    }
}
