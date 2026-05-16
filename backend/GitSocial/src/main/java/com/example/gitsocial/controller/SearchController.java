package com.example.gitsocial.controller;

import com.example.gitsocial.domain.dto.SearchResponse;
import com.example.gitsocial.domain.entities.User;
import com.example.gitsocial.services.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping("/search")
    public ResponseEntity<SearchResponse> search(@RequestParam String query, Authentication authentication) {
        java.util.UUID currentUserId = null;
        if (authentication != null && authentication.getPrincipal() instanceof User user) {
            currentUserId = user.getId();
        }
        return ResponseEntity.ok(searchService.globalSearch(query, currentUserId));
    }
}