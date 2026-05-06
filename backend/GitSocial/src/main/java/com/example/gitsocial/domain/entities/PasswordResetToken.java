package com.example.gitsocial.domain.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "password_reset_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Kullanıcıya e-posta ile gidecek olan o uzun ve benzersiz metin
    @Column(nullable = false, unique = true)
    private String token;

    // Bu token hangi kullanıcıya ait? (User tablosu ile ilişki)
    @OneToOne(targetEntity = User.class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "user_id")
    private User user;

    // Token'ın son kullanma tarihi (Örn: 15 dakika geçerli olsun)
    @Column(nullable = false)
    private Instant expiryDate;

    // Token'ın süresinin dolup dolmadığını kontrol eden minik bir metod
    public boolean isExpired() {
        return Instant.now().isAfter(expiryDate);
    }
}