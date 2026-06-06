package com.matheushenrique.nexum.dtos.response;

import com.matheushenrique.nexum.entities.SubscriptionCycle;
import java.time.LocalDate;
import java.util.UUID;

public record RecentPaymentResponse(
        UUID cycleId,
        UUID subscriptionId,
        String clientName,
        String planName,
        LocalDate dueDate,
        String status,
        long amount
) {
    public static RecentPaymentResponse from(SubscriptionCycle c) {
        return new RecentPaymentResponse(
                c.getId(),
                c.getSubscription().getId(),
                c.getSubscription().getClient().getName(),
                c.getSubscription().getPlan().getName(),
                c.getDueDate(),
                c.getStatus().name(),
                c.getAmountCents()
        );
    }
}