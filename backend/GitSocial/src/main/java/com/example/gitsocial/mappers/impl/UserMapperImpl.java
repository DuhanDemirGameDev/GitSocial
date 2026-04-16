package com.example.gitsocial.mappers.impl;

import com.example.gitsocial.domain.dto.RegisterRequest;
import com.example.gitsocial.domain.dto.UserDto;
import com.example.gitsocial.domain.entities.User;
import com.example.gitsocial.domain.entities.SystemRole;
import com.example.gitsocial.mappers.UserMapper;
import org.springframework.stereotype.Component;

@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public User fromRegisterRequest(RegisterRequest request) {
        if (request == null) {
            return null;
        }

        return User.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .email(request.email())
                .password(request.password()) // Dikkat: Bu şifre düz metin! AuthService içinde BCrypt ile şifreleyeceğiz.
                .role(SystemRole.USER) // Yeni kayıt olan herkes varsayılan olarak USER rolündedir.
                .build();
    }

    @Override
    public UserDto toDto(User user) {
        if (user == null) {
            return null;
        }

        return new UserDto(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail()
        );
    }
}