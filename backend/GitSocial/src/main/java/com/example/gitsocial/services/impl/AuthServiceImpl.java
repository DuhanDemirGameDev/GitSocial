package com.example.gitsocial.services.impl;

import com.example.gitsocial.domain.dto.RegisterRequest;
import com.example.gitsocial.domain.dto.UserDto;
import com.example.gitsocial.domain.entities.User;
import com.example.gitsocial.mappers.UserMapper;
import com.example.gitsocial.repositories.UserRepository;
import com.example.gitsocial.services.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.gitsocial.domain.dto.AuthResponse;
import com.example.gitsocial.domain.dto.LoginRequest;
import com.example.gitsocial.exception.ResourceNotFoundException;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDto register(RegisterRequest request) {
        // 1. E-posta adresi daha önce kullanılmış mı kontrol et
        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Bu e-posta adresi zaten sistemde kayıtlı.");
        }

        // 2. DTO'yu Entity'ye çevir (Rol ataması mapper içinde yapılıyor)
        User user = userMapper.fromRegisterRequest(request);

        // 3. Şifreyi BCrypt ile şifrele
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // 4. Veri tabanına kaydet
        User savedUser = userRepository.save(user);

        // 5. Kaydedilen kullanıcıyı DTO olarak geri dön
        return userMapper.toDto(savedUser);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        // 1. Kullanıcıyı e-posta ile bul
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("Hatalı e-posta veya şifre"));

        // 2. Şifre eşleşiyor mu kontrol et (Gelen düz metin ile DB'deki BCrypt hash'ini karşılaştırır)
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            // Güvenlik gereği hangi bilginin yanlış olduğunu açık etmiyoruz, ikisi için de aynı mesaj!
            throw new RuntimeException("Hatalı e-posta veya şifre");
        }

        // 3. User Entity'sini güvenli UserDto'ya çevir
        UserDto userDto = userMapper.toDto(user);

        // 4. Şimdilik geçici bir token koyuyoruz. (Görev-2'deki JWT entegrasyonu gelince burası değişecek)
        String dummyToken = "jwt-token-buraya-gelecek";

        // 5. Sonucu dön
        return new AuthResponse(userDto, dummyToken);
    }
}