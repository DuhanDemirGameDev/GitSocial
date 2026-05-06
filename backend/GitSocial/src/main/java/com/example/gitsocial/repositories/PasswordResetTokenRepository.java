package com.example.gitsocial.repositories;

import com.example.gitsocial.domain.entities.PasswordResetToken;
import com.example.gitsocial.domain.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    // Gelen token metnine göre veri tabanından token'ı bulma
    Optional<PasswordResetToken> findByToken(String token);

    // Kullanıcı yeni şifre istediğinde eski token'ları temizlemek için
    void deleteByUser(User user);
}