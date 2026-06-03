package com.matheushenrique.nexum.dtos.response;

import com.matheushenrique.nexum.entities.SubscriptionCycle;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record SubscriptionCycleResponse(
        UUID id,
        LocalDate dueDate,
        Instant paidAt,
        Integer amountCents,
        String amountFormatted,
        SubscriptionCycle.CycleStatus status,
        String statusLabel,
        Instant createdAt
) {
    public static SubscriptionCycleResponse from(SubscriptionCycle c) {
        return new SubscriptionCycleResponse(
                c.getId(),
                c.getDueDate(),
                c.getPaidAt(),
                c.getAmountCents(),
                formatAmount(c.getAmountCents()),
                c.getStatus(),
                statusLabel(c.getStatus()),
                c.getCreatedAt()
        );
    }

    private static String formatAmount(int cents) {
        return "R$ " + String.format("%.2f", cents / 100.0).replace('.', ',');
    }

    private static String statusLabel(SubscriptionCycle.CycleStatus status) {
        return switch (status) {
            case PENDING -> "Pendente";
            case PAID    -> "Pago";
            case OVERDUE -> "Vencido";
        };
    }
}