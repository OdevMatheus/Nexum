package com.matheushenrique.nexum.services;

import com.matheushenrique.nexum.dtos.response.NotificationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

public interface NotificationService {
    Page<NotificationResponse> findAll(UUID ownerId, Pageable pageable);
    long countUnread(UUID ownerId);
    void markAsRead(UUID ownerId, UUID notificationId);
    void markAllAsRead(UUID ownerId);
    void createIfAbsent(UUID ownerId, UUID subscriptionId, String type, String message);
}