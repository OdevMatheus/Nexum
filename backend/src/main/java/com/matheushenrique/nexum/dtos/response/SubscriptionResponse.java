package com.matheushenrique.nexum.dtos.response;

import com.matheushenrique.nexum.entities.Subscription;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record SubscriptionResponse(
        UUID id,
        UUID clientId,
        String clientName,
        String clientEmail,
        UUID planId,
        String planName,
        String planAmountFormatted,
        String planRecurrenceLabel,
        Subscription.Status status,
        String statusLabel,
        LocalDate startDate,
        LocalDate nextDueDate,
        Instant cancelledAt,
        Instant createdAt,
        Instant updatedAt
) {
    public static SubscriptionResponse from(Subscription s) {
        return new SubscriptionResponse(
                s.getId(),
                s.getClient().getId(),
                s.getClient().getName(),
                s.getClient().getEmail(),
                s.getPlan().getId(),
                s.getPlan().getName(),
                formatAmount(s.getPlan().getAmountCents()),
                recurrenceLabel(s.getPlan().getRecurrence().name()),
                s.getStatus(),
                statusLabel(s.getStatus()),
                s.getStartDate(),
                s.getNextDueDate(),
                s.getCancelledAt(),
                s.getCreatedAt(),
                s.getUpdatedAt()
        );
    }

    private static String formatAmount(int cents) {
        return "R$ " + String.format("%.2f", cents / 100.0).replace('.', ',');
    }

    private static String recurrenceLabel(String recurrence) {
        return switch (recurrence) {
            case "MONTHLY"    -> "Mensal";
            case "QUARTERLY"  -> "Trimestral";
            case "SEMIANNUAL" -> "Semestral";
            case "ANNUAL"     -> "Anual";
            case "CUSTOM"     -> "Personalizado";
            default           -> recurrence;
        };
    }

    private static String statusLabel(Subscription.Status status) {
        return switch (status) {
            case TRIAL       -> "Trial";
            case ACTIVE      -> "Ativa";
            case OVERDUE     -> "Vencida";
            case SUSPENDED   -> "Suspensa";
            case CANCELLED   -> "Cancelada";
            case REACTIVATED -> "Reativada";
        };
    }
}