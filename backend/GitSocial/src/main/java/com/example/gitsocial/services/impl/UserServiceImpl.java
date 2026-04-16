package com.example.gitsocial.services.impl;

import com.example.gitsocial.domain.dto.UserDto;
import com.example.gitsocial.exception.ResourceNotFoundException;
import com.example.gitsocial.mappers.UserMapper;
import com.example.gitsocial.repositories.UserRepository;
import com.example.gitsocial.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

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
}