package com.example.gitsocial.repositories;

import com.example.gitsocial.domain.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    // Kullanıcı giriş yaparken e-posta adresinden kullanıcıyı bulmak için
    Optional<User> findByEmail(String email);

    // Yeni kayıt olurken bu e-posta adresi sistemde var mı diye kontrol etmek için
    boolean existsByEmail(String email);
}