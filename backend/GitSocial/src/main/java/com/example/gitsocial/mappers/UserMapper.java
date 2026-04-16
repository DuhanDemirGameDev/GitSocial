package com.example.gitsocial.mappers;

import com.example.gitsocial.domain.dto.RegisterRequest;
import com.example.gitsocial.domain.dto.UserDto;
import com.example.gitsocial.domain.entities.User;

public interface UserMapper {
    User fromRegisterRequest(RegisterRequest registerRequest);
    UserDto toDto(User user);
}