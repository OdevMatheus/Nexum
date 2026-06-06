package com.matheushenrique.nexum.dtos.response;

import com.matheushenrique.nexum.entities.Subscription;
import java.time.LocalDate;
import java.util.UUID;

public record UpcomingSubscriptionResponse(
        UUID subscriptionId,
        String clientName,
        String planName,
        LocalDate dueDate,
        long amount
) {
    public static UpcomingSubscriptionResponse from(Subscription s) {
        return new UpcomingSubscriptionResponse(
                s.getId(),
                s.getClient().getName(),
                s.getPlan().getName(),
                s.getNextDueDate(),
                s.getPlan().getAmountCents()
        );
    }
}