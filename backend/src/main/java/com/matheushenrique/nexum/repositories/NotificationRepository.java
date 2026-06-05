package com.matheushenrique.nexum.repositories;

import com.matheushenrique.nexum.entities.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    Page<Notification> findAllByOwnerIdOrderByCreatedAtDesc(UUID ownerId, Pageable pageable);

    long countByOwnerIdAndReadFalse(UUID ownerId);

    boolean existsByOwnerIdAndSubscriptionIdAndType(UUID ownerId, UUID subscriptionId, String type);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.ownerId = :ownerId AND n.read = false")
    void markAllAsReadByOwnerId(@Param("ownerId") UUID ownerId);
}