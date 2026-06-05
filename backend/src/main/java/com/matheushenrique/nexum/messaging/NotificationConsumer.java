package com.matheushenrique.nexum.messaging;

import com.matheushenrique.nexum.entities.Enum.NotificationType;
import com.matheushenrique.nexum.messaging.events.SubscriptionStatusChangedEvent;
import com.matheushenrique.nexum.services.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationConsumer {

    private static final Set<String> NOTIFIABLE_STATUSES = Set.of("OVERDUE", "SUSPENDED");

    private final NotificationService notificationService;

    @KafkaListener(
            topics = "subscription-status-changed",
            groupId = "nexum-notification-consumer",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void onStatusChanged(SubscriptionStatusChangedEvent event) {
        log.info("NotificationConsumer received: subscriptionId={} newStatus={}",
                event.subscriptionId(), event.newStatus());

        if (!NOTIFIABLE_STATUSES.contains(event.newStatus())) {
            return;
        }

        String type = resolveType(event.newStatus());
        String message = buildMessage(event);

        notificationService.createIfAbsent(
                event.ownerId(),
                event.subscriptionId(),
                type,
                message
        );
    }

    private String resolveType(String status) {
        return switch (status) {
            case "OVERDUE"   -> NotificationType.PAYMENT_OVERDUE.name();
            case "SUSPENDED" -> NotificationType.SUBSCRIPTION_SUSPENDED.name();
            default          -> status;
        };
    }

    private String buildMessage(SubscriptionStatusChangedEvent event) {
        return switch (event.newStatus()) {
            case "OVERDUE"   -> "Subscription " + event.subscriptionId() + " has a payment overdue.";
            case "SUSPENDED" -> "Subscription " + event.subscriptionId() + " has been suspended due to non-payment.";
            default          -> "Subscription " + event.subscriptionId() + " status changed to " + event.newStatus() + ".";
        };
    }
}