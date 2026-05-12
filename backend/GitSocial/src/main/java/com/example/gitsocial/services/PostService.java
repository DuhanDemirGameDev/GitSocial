package com.example.gitsocial.services;

import com.example.gitsocial.domain.dto.PostRequestDto;
import com.example.gitsocial.domain.dto.PostResponse;
import com.example.gitsocial.domain.entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface PostService {

    PostResponse createPost(PostRequestDto request, MultipartFile media, User author);

    PostResponse updatePost(UUID postId, PostRequestDto request, User currentUser);

    void deletePost(UUID postId, User currentUser);

    Page<PostResponse> getFeed(Pageable pageable, UUID currentUserId);

    Page<PostResponse> getCommunityPosts(UUID communityId, Pageable pageable, UUID currentUserId);
}
