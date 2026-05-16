package com.example.gitsocial.repositories;

import com.example.gitsocial.domain.entities.UserFollow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserFollowRepository extends JpaRepository<UserFollow, UUID> {

    // İki kullanıcı arasında takip ilişkisi var mı? (Takipten çıkma işlemi için)
    Optional<UserFollow> findByFollowerIdAndFollowingId(UUID followerId, UUID followingId);

    boolean existsByFollowerIdAndFollowingId(UUID followerId, UUID followingId);

    // Profilde takipçi/takip edilen sayılarını göstermek için
    long countByFollowerId(UUID followerId); // Kaç kişiyi takip ediyor?
    long countByFollowingId(UUID followingId); // Kaç takipçisi var?

    // Takipçileri ve Takip Edilenleri listelemek için
    List<UserFollow> findByFollowingId(UUID followingId); // Beni takip edenler
    List<UserFollow> findByFollowerId(UUID followerId); // Benim takip ettiklerim
}