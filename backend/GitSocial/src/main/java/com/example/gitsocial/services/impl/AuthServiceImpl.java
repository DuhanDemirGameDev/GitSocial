package com.example.gitsocial.services.impl;

import com.example.gitsocial.domain.dto.*;
import com.example.gitsocial.domain.entities.PasswordResetToken;
import com.example.gitsocial.domain.entities.RefreshToken;
import com.example.gitsocial.domain.entities.User;
import com.example.gitsocial.exception.ResourceAlreadyExistsException;
import com.example.gitsocial.exception.UnauthorizedException;
import com.example.gitsocial.mappers.UserMapper;
import com.example.gitsocial.repositories.PasswordResetTokenRepository;
import com.example.gitsocial.repositories.RefreshTokenRepository;
import com.example.gitsocial.repositories.UserRepository;
import com.example.gitsocial.security.JwtService;
import com.example.gitsocial.services.AuthService;
import com.example.gitsocial.services.EmailService;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;

    @Override
    @Transactional
    public UserDto register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ResourceAlreadyExistsException("Bu e-posta adresi zaten sistemde kayıtlı.");
        }

        User user = userMapper.fromRegisterRequest(request);
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        User savedUser = userRepository.save(user);
        return userMapper.toDto(savedUser);
    }

    @Override
    @Transactional
    public AuthSessionResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new UnauthorizedException("Hatalı e-posta veya şifre"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new UnauthorizedException("Hatalı e-posta veya şifre");
        }

        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        RefreshToken tokenEntity = RefreshToken.builder()
                .tokenHash(hashToken(refreshToken))
                .expiresAt(Instant.now().plusMillis(jwtService.getRefreshTokenExpirationMs()))
                .user(user)
                .build();
        refreshTokenRepository.save(tokenEntity);

        AuthResponse authResponse = new AuthResponse(
                userMapper.toDto(user),
                accessToken,
                jwtService.getAccessTokenExpirationMs()
        );

        return new AuthSessionResponse(
                authResponse,
                refreshToken,
                jwtService.getRefreshTokenExpirationMs()
        );
    }

    @Override
    @Transactional
    public RefreshTokenResponse refresh(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new UnauthorizedException("Refresh token bulunamadı.");
        }

        try {
            String tokenHash = hashToken(refreshToken);
            RefreshToken storedToken = refreshTokenRepository.findByTokenHash(tokenHash)
                    .orElseThrow(() -> new UnauthorizedException("Refresh token geçersiz."));

            if (!storedToken.isActive()) {
                refreshTokenRepository.delete(storedToken);
                throw new UnauthorizedException("Refresh token süresi dolmuş veya iptal edilmiş.");
            }

            String userEmail = jwtService.extractUsername(refreshToken);
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new UnauthorizedException("Kullanıcı bulunamadı."));

            if (!jwtService.isTokenValid(refreshToken, user)) {
                refreshTokenRepository.delete(storedToken);
                throw new UnauthorizedException("Refresh token doğrulanamadı.");
            }

            String newAccessToken = jwtService.generateToken(user);
            return new RefreshTokenResponse(newAccessToken, jwtService.getAccessTokenExpirationMs());
        } catch (JwtException | IllegalArgumentException ex) {
            throw new UnauthorizedException("Refresh token geçersiz.");
        }
    }

    @Override
    @Transactional
    public LogoutResponse logout(String refreshToken) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            refreshTokenRepository.deleteByTokenHash(hashToken(refreshToken));
        }

        return new LogoutResponse("Çıkış işlemi başarılı.");
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 algoritması kullanılamıyor.", ex);
        }
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        // 1. Kullanıcıyı bul
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new UnauthorizedException("Kullanıcı bulunamadı."));
        // Not: Güvenlik için normalde "Eğer mail varsa gönderdik" denir,
        // ama biz geliştirme aşamasında hatayı net görmek için fırlatıyoruz.

        // 2. Varsa eski token'i temizle. Flush, unique user_id constraint'i
        // yeni token insert edilmeden once serbest birakir.
        passwordResetTokenRepository.findByUser(user).ifPresent(existingToken -> {
            passwordResetTokenRepository.delete(existingToken);
            passwordResetTokenRepository.flush();
        });

        // 3. 36 karakterlik rastgele ve eşsiz bir token (bilet) üret
        String token = java.util.UUID.randomUUID().toString();

        // 4. Veri tabanına kaydet (15 dakika geçerli olacak)
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(Instant.now().plus(15, java.time.temporal.ChronoUnit.MINUTES))
                .build();
        passwordResetTokenRepository.save(resetToken);

        // 5. Frontend'deki şifre sıfırlama ekranının linkini oluştur (Token'ı sonuna ekleyerek)
        String resetLink = "http://localhost:5173/reset-password?token=" + token;

        // 6. O havalı HTML e-postamızı yolla!
        emailService.sendPasswordResetEmail(user.getEmail(), resetLink, token);
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        // 1. Gelen token veri tabanında var mı?
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.token())
                .orElseThrow(() -> new UnauthorizedException("Geçersiz veya hatalı token."));

        // 2. Token'ın süresi dolmuş mu?
        if (resetToken.isExpired()) {
            passwordResetTokenRepository.delete(resetToken);
            throw new UnauthorizedException("Bu bağlantının süresi dolmuş. Lütfen tekrar şifre sıfırlama isteğinde bulunun.");
        }

        // 3. Kullanıcıyı al, yeni şifreyi kriptola ve kaydet
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        // 4. Kullanılmış bileti imha et (Aynı linkle tekrar şifre değiştirilemesin)
        passwordResetTokenRepository.delete(resetToken);
    }
}
