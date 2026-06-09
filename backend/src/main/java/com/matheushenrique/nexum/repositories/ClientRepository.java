package com.matheushenrique.nexum.repositories;

import com.matheushenrique.nexum.entities.Client;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ClientRepository extends JpaRepository<Client, UUID> {

    List<Client> findAllByOwnerId(UUID ownerId);

    Optional<Client> findByIdAndActiveTrueAndOwnerId(UUID id, UUID ownerId);

    @Modifying
    @Transactional
    @Query(value = "UPDATE clients SET created_at = :createdAt WHERE id = :id", nativeQuery = true)
    void updateCreatedAt(@Param("id") UUID id, @Param("createdAt") Instant createdAt);

    boolean existsByEmailAndActiveTrueAndOwnerId(String email, UUID ownerId);

    boolean existsByEmailAndActiveTrueAndIdNotAndOwnerId(String email, UUID id, UUID ownerId);

    @Query("""
        SELECT c FROM Client c
        WHERE c.active = true
        AND c.owner.id = :ownerId
        AND (:search IS NULL
             OR LOWER(c.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
             OR LOWER(c.email) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))
    """)
    Page<Client> findAllActiveWithSearch(
            @Param("search") String search,
            @Param("ownerId") UUID ownerId,
            Pageable pageable
    );
}