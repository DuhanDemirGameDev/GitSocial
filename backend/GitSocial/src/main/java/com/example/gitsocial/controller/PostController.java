package com.example.gitsocial.controller;

import com.example.gitsocial.domain.dto.PostRequestDto;
import com.example.gitsocial.domain.dto.PostResponse;
import com.example.gitsocial.domain.entities.User;
import com.example.gitsocial.exception.UnauthorizedException;
import com.example.gitsocial.services.PostService;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
@Validated
public class PostController {

    private static final int MAX_PAGE_SIZE = 20;

    private final PostService postService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostResponse> createPost(
            @RequestParam(name = "content", required = false)
            @Size(max = 1000, message = "Post content can be at most 1000 characters.")
            String content,
            @RequestParam(name = "mediaUrl", required = false)
            @Size(max = 2048, message = "Media URL can be at most 2048 characters.")
            String mediaUrl,
            @RequestParam(name = "communityId", required = false) UUID communityId,
            @RequestPart(name = "media", required = false) MultipartFile media,
            Authentication authentication
    ) {
        PostRequestDto request = new PostRequestDto(content, mediaUrl, communityId);
        PostResponse response = postService.createPost(request, media, currentUser(authentication));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/feed")
    public ResponseEntity<Page<PostResponse>> getFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.max(1, Math.min(size, MAX_PAGE_SIZE));
        Pageable pageable = PageRequest.of(safePage, safeSize);
        return ResponseEntity.ok(postService.getFeed(pageable, currentUser(authentication).getId()));
    }

    private User currentUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new UnauthorizedException("Authenticated user could not be resolved.");
        }

        return user;
    }
}
