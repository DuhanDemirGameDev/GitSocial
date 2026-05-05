package com.example.gitsocial.services.impl;

import com.example.gitsocial.domain.dto.PostRequestDto;
import com.example.gitsocial.domain.dto.PostResponse;
import com.example.gitsocial.domain.dto.UserDto;
import com.example.gitsocial.domain.entities.Post;
import com.example.gitsocial.domain.entities.User;
import com.example.gitsocial.repositories.PostRepository;
import com.example.gitsocial.services.CloudinaryService;
import com.example.gitsocial.services.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final CloudinaryService cloudinaryService;

    @Value("${app.cloudinary.upload-timeout-ms}")
    private long uploadTimeoutMs;

    @Override
    @Transactional
    public PostResponse createPost(PostRequestDto request, MultipartFile media, User author) {
        String content = normalizeContent(request.content());
        boolean hasMedia = media != null && !media.isEmpty();

        if ((content == null || content.isBlank()) && !hasMedia) {
            throw new IllegalArgumentException("Post must include text content, media, or both.");
        }

        String mediaUrl = hasMedia ? uploadMedia(media) : null;

        Post post = Post.builder()
                .content(content)
                .mediaUrl(mediaUrl)
                .author(author)
                .createdAt(Instant.now())
                .popularityScore(calculateInitialPopularityScore(content, mediaUrl))
                .build();

        return toResponse(postRepository.save(post));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PostResponse> getFeed(Pageable pageable) {
        return postRepository.findAllByOrderByPopularityScoreDescCreatedAtDesc(pageable)
                .map(this::toResponse);
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

    private PostResponse toResponse(Post post) {
        User author = post.getAuthor();
        UserDto authorDto = new UserDto(
                author.getId(),
                author.getFirstName(),
                author.getLastName(),
                author.getEmail()
        );

        return new PostResponse(
                post.getId(),
                post.getContent(),
                post.getMediaUrl(),
                post.getPopularityScore(),
                post.getCreatedAt(),
                authorDto
        );
    }
}
