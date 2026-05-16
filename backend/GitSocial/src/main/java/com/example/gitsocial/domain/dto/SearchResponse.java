package com.example.gitsocial.domain.dto;

import java.util.List;

public record SearchResponse(
        List<UserDto> users,
        List<PostResponse> posts,
        List<CommunityResponse> communities
) {}