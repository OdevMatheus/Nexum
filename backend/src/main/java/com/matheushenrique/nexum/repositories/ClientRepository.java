package com.matheushenrique.nexum.repositories;

import com.matheushenrique.nexum.entities.Client;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface ClientRepository extends JpaRepository<Client, UUID> {

    Optional<Client> findByIdAndActiveTrueAndOwnerId(UUID id, UUID ownerId);

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