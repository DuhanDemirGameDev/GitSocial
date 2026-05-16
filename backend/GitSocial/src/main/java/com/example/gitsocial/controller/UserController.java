package com.example.gitsocial.controller;

import com.example.gitsocial.domain.dto.UserDto;
import com.example.gitsocial.domain.entities.User;
import com.example.gitsocial.exception.UnauthorizedException;
import com.example.gitsocial.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // Takip Et / Takipten Çık
    @PostMapping("/{targetUserId}/follow")
    public ResponseEntity<String> toggleFollow(
            @PathVariable UUID targetUserId,
            Authentication authentication
    ) {
        userService.toggleFollow(currentUser(authentication).getId(), targetUserId);
        return ResponseEntity.ok("Takip işlemi başarıyla güncellendi.");
    }

    private User currentUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new UnauthorizedException("Kimlik doğrulama hatası.");
        }
        return user;
    }

    // Biyografi Güncelleme Uç Noktası
    @PutMapping("/profile/bio")
    public ResponseEntity<UserDto> updateBio(
            @jakarta.validation.Valid @RequestBody com.example.gitsocial.domain.dto.UpdateBioRequest request,
            Authentication authentication
    ) {
        UserDto updatedUser = userService.updateBio(currentUser(authentication).getId(), request.bio());
        return ResponseEntity.ok(updatedUser);
    }

    // Kullanıcı Profili Detayları ve Postları
    @GetMapping("/{userId}/profile")
    public ResponseEntity<com.example.gitsocial.domain.dto.UserProfileResponse> getUserProfile(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication
    ) {
        // Eğer kullanıcı giriş yapmadıysa anonim olarak da profili görebilsin (currentUserId null gider)
        UUID currentUserId = (authentication != null) ? currentUser(authentication).getId() : null;

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
                Math.max(page, 0),
                Math.max(1, Math.min(size, 20)),
                org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt")
        );

        return ResponseEntity.ok(userService.getUserProfile(userId, currentUserId, pageable));
    }
}