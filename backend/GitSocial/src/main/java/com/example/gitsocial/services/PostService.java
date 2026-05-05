package com.example.gitsocial.services;

import com.example.gitsocial.domain.dto.PostRequestDto;
import com.example.gitsocial.domain.dto.PostResponse;
import com.example.gitsocial.domain.entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface PostService {

    PostResponse createPost(PostRequestDto request, MultipartFile media, User author);

    Page<PostResponse> getFeed(Pageable pageable);
}
