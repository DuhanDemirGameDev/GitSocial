package com.example.gitsocial.services;

import com.example.gitsocial.domain.dto.UserDto;
import java.util.UUID;

public interface UserService {
    UserDto getUserDtoById(UUID id);
    UserDto getUserDtoByEmail(String email);
}