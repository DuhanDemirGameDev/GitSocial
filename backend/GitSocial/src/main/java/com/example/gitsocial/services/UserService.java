package com.example.gitsocial.services;

import com.example.gitsocial.domain.dto.UserDto;
import com.example.gitsocial.domain.dto.UserProfileResponse;

import java.util.UUID;

public interface UserService {
    UserDto getUserDtoById(UUID id);
    UserDto getUserDtoByEmail(String email);
    // Kullanıcıyı takip et veya takipten çık
    void toggleFollow(UUID currentUserId, UUID targetUserId);
    UserDto updateBio(UUID userId, String bio);
    UserProfileResponse getUserProfile(UUID targetUserId, UUID currentUserId, org.springframework.data.domain.Pageable pageable);
    UserDto uploadProfilePicture(java.util.UUID userId, org.springframework.web.multipart.MultipartFile file);
}