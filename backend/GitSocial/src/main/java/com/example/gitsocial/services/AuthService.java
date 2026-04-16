package com.example.gitsocial.services;

import com.example.gitsocial.domain.dto.RegisterRequest;
import com.example.gitsocial.domain.dto.UserDto;

public interface AuthService {
    UserDto register(RegisterRequest request);
}