package com.matheushenrique.nexum.messaging.events;

import java.time.Instant;
import java.util.UUID;

public record SubscriptionStatusChangedEvent(
        UUID subscriptionId,
        UUID ownerId,
        UUID clientId,
        String clientName,
        String clientEmail,
        String planName,
        String previousStatus,
        String newStatus,
        Instant occurredAt
) {}