package com.example.gitsocial.services.impl;

import com.example.gitsocial.domain.dto.PostResponse;
import com.example.gitsocial.domain.dto.UserDto;
import com.example.gitsocial.domain.dto.UserProfileResponse;
import com.example.gitsocial.domain.entities.User;
import com.example.gitsocial.domain.entities.UserFollow;
import com.example.gitsocial.exception.ResourceNotFoundException;
import com.example.gitsocial.mappers.UserMapper;
import com.example.gitsocial.repositories.PostRepository;
import com.example.gitsocial.repositories.UserFollowRepository;
import com.example.gitsocial.repositories.UserRepository;
import com.example.gitsocial.services.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final UserFollowRepository userFollowRepository;
    private final PostRepository postRepository;

    @Override
    public UserDto getUserDtoById(UUID id) {
        return userRepository.findById(id)
                .map(userMapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Belirtilen ID'ye sahip kullanıcı bulunamadı."));
    }

    @Override
    public UserDto getUserDtoByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(userMapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Belirtilen e-posta adresine sahip kullanıcı bulunamadı."));
    }

    @Override
    @Transactional
    public void toggleFollow(UUID currentUserId, UUID targetUserId) {
        if (currentUserId.equals(targetUserId)) {
            throw new IllegalArgumentException("Kendinizi takip edemezsiniz.");
        }

        User follower = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("İstek atan kullanıcı bulunamadı."));

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Takip edilecek kullanıcı bulunamadı."));

        // Eğer zaten takip ediyorsa takipten çık, etmiyorsa takip et!
        userFollowRepository.findByFollowerIdAndFollowingId(currentUserId, targetUserId)
                .ifPresentOrElse(
                        // Varsa sil (Takipten Çık)
                        existingFollow -> userFollowRepository.delete(existingFollow),
                        // Yoksa ekle (Takip Et)
                        () -> {
                            UserFollow newFollow = UserFollow.builder()
                                    .follower(follower)
                                    .following(targetUser)
                                    .build();
                            userFollowRepository.save(newFollow);
                        }
                );
    }

    @Override
    @Transactional
    public UserDto updateBio(UUID userId, String bio) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı."));

        // Sağındaki ve solundaki gereksiz boşlukları temizleyerek kaydedelim
        user.setBio(bio != null ? bio.trim() : null);
        return userMapper.toDto(userRepository.save(user));
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public UserProfileResponse getUserProfile(UUID targetUserId, UUID currentUserId, org.springframework.data.domain.Pageable pageable) {
        // 1. Hedef profili bulalım
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Profil sahibi kullanıcı bulunamadı."));

        // 2. Takipçi ve Takip Edilen sayılarını çekelim
        long followingCount = userFollowRepository.countByFollowerId(targetUserId);
        long followerCount = userFollowRepository.countByFollowingId(targetUserId);

        // 3. Giriş yapmış olan kullanıcı bu profili takip ediyor mu? (Buton durumu için)
        boolean isFollowing = currentUserId != null &&
                userFollowRepository.existsByFollowerIdAndFollowingId(currentUserId, targetUserId);

        // 4. Kullanıcının paylaştığı postları tarihe göre tersten çekelim ve Mapleyelim
        // Not: postRepository içinde 'findByAuthorIdOrderByCreatedAtDesc' metodunun olduğunu varsayıyoruz.
        // Eğer yoksa PostRepository içine: Page<Post> findByAuthorId(UUID authorId, Pageable pageable); ekleyebilirsin.
        Page<PostResponse> posts = postRepository.findByAuthorId(targetUserId, pageable)
                .map(post -> new PostResponse(
                        post.getId(),
                        post.getContent(),
                        post.getMediaUrl(), // 3. Parametre: Medya URL (Eğer post entity'de varsa)
                        post.getPopularityScore(), // 4. Parametre: Popülerlik Puanı
                        post.getCreatedAt(),
                        // 6. Parametre: Yazar Bilgisi (UserDto)
                        new UserDto(
                                targetUser.getId(),
                                targetUser.getFirstName(),
                                targetUser.getLastName(),
                                targetUser.getEmail(),
                                targetUser.getProfilePictureUrl(),
                                targetUser.getBio()
                        ),
                        // 7 ve 8. Parametreler: Topluluk ID ve Adı (Eğer post bir topluluğa aitse)
                        post.getCommunity() != null ? post.getCommunity().getId() : null,
                        post.getCommunity() != null ? post.getCommunity().getName() : null,
                        // 9, 10 ve 11. Parametreler: İstatistikler
                        0L,   // likeCount (Profilde hızlı yüklenmesi için şimdilik 0 veriyoruz)
                        0L,   // commentCount
                        false // likedByCurrentUser
                ));

        return new UserProfileResponse(
                targetUser.getId(),
                targetUser.getFirstName(),
                targetUser.getLastName(),
                targetUser.getEmail(),
                targetUser.getProfilePictureUrl(),
                targetUser.getBio(),
                followerCount,
                followingCount,
                isFollowing,
                posts
        );
    }
}