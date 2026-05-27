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

    Optional<Client> findByIdAndActiveTrue(UUID id);

    boolean existsByEmailAndActiveTrue(String email);

    boolean existsByEmailAndActiveTrueAndIdNot(String email, UUID id);

    @Query("""
        SELECT c FROM Client c
        WHERE c.active = true
        AND (:search IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%'))
             OR LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')))
    """)
    Page<Client> findAllActiveWithSearch(@Param("search") String search, Pageable pageable);
}