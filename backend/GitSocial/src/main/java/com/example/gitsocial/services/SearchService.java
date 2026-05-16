package com.example.gitsocial.services;

import com.example.gitsocial.domain.dto.SearchResponse;

public interface SearchService {
    SearchResponse globalSearch(String query, java.util.UUID currentUserId);
}