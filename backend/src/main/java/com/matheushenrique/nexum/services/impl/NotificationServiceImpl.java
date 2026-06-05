package com.matheushenrique.nexum.services.impl;

import com.matheushenrique.nexum.dtos.response.NotificationResponse;
import com.matheushenrique.nexum.entities.Notification;
import com.matheushenrique.nexum.repositories.NotificationRepository;
import com.matheushenrique.nexum.security.exceptions.ResourceNotFoundException;
import com.matheushenrique.nexum.services.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    public Page<NotificationResponse> findAll(UUID ownerId, Pageable pageable) {
        return notificationRepository
                .findAllByOwnerIdOrderByCreatedAtDesc(ownerId, pageable)
                .map(NotificationResponse::from);
    }

    @Override
    public long countUnread(UUID ownerId) {
        return notificationRepository.countByOwnerIdAndReadFalse(ownerId);
    }

    @Override
    @Transactional
    public void markAsRead(UUID ownerId, UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .filter(n -> n.getOwnerId().equals(ownerId))
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(UUID ownerId) {
        notificationRepository.markAllAsReadByOwnerId(ownerId);
    }

    @Override
    @Transactional
    public void createIfAbsent(UUID ownerId, UUID subscriptionId, String type, String message) {
        boolean exists = notificationRepository
                .existsByOwnerIdAndSubscriptionIdAndType(ownerId, subscriptionId, type);

        if (exists) {
            log.info("Notification already exists for owner={} subscription={} type={} — skipping",
                    ownerId, subscriptionId, type);
            return;
        }

        Notification notification = Notification.builder()
                .ownerId(ownerId)
                .subscriptionId(subscriptionId)
                .type(type)
                .message(message)
                .read(false)
                .build();

        notificationRepository.save(notification);
        log.info("Notification created: owner={} subscription={} type={}", ownerId, subscriptionId, type);
    }
}