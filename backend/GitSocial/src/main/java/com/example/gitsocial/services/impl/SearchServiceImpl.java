package com.example.gitsocial.services.impl;

import com.example.gitsocial.domain.dto.CommunityResponse;
import com.example.gitsocial.domain.dto.PostResponse;
import com.example.gitsocial.domain.dto.SearchResponse;
import com.example.gitsocial.domain.dto.UserDto;
import com.example.gitsocial.repositories.CommunityRepository;
import com.example.gitsocial.repositories.PostRepository;
import com.example.gitsocial.repositories.UserRepository;
import com.example.gitsocial.services.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommunityRepository communityRepository; // Topluluklar için eklendi

    @Override
    @Transactional(readOnly = true)
    public SearchResponse globalSearch(String query, UUID currentUserId) {
        // Eğer arama kutusu boş gelirse 3 tane boş liste döndür (İlk Hatanın Çözümü)
        if (query == null || query.trim().isBlank()) {
            return new SearchResponse(List.of(), List.of(), List.of());
        }

        String cleanQuery = query.trim();

        // 1. Kullanıcıları Ara ve Maple
        List<UserDto> users = userRepository.searchUsers(cleanQuery).stream()
                .map(u -> new UserDto(u.getId(), u.getFirstName(), u.getLastName(), u.getEmail(), u.getProfilePictureUrl(), u.getBio(), u.getAccountType()))
                .collect(Collectors.toList());

        // 2. Postları Ara ve Maple
        List<PostResponse> posts = postRepository.searchPosts(cleanQuery).stream()
                .map(p -> new PostResponse(
                        p.getId(),
                        p.getContent(),
                        p.getMediaUrl(),
                        p.getPopularityScore(),
                        p.getCreatedAt(),
                        new UserDto(p.getAuthor().getId(), p.getAuthor().getFirstName(), p.getAuthor().getLastName(), p.getAuthor().getEmail(), p.getAuthor().getProfilePictureUrl(), p.getAuthor().getBio(), p.getAuthor().getAccountType()),
                        p.getCommunity() != null ? p.getCommunity().getId() : null,
                        p.getCommunity() != null ? p.getCommunity().getName() : null,
                        0L, 0L, false // Beğeni/Yorum sayıları hızlı arama için ham geçildi
                )).collect(Collectors.toList());

        // 3. Toplulukları Ara ve Maple (YENİ EKLENDİ)
        List<CommunityResponse> communities = communityRepository.searchCommunities(cleanQuery).stream()
                .map(c -> new CommunityResponse(
                        c.getId(),
                        c.getName(),
                        c.getDescription(),
                        c.getCreatedAt(),
                        c.isPublic(),
                        0L,    // Üye sayısı (hızlı arama için 0 geçildi)
                        false, // Giriş yapan kullanıcı üye mi
                        null   // Kullanıcının topluluktaki rolü
                )).collect(Collectors.toList());

        // Kullanıcılar, Postlar ve Topluluklar 3 parametre olarak dönülüyor (İkinci Hatanın Çözümü)
        return new SearchResponse(users, posts, communities);
    }
}