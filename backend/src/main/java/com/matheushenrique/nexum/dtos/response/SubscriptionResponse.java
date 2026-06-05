package com.matheushenrique.nexum.dtos.response;

import com.matheushenrique.nexum.entities.Subscription;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record SubscriptionResponse(
        @Schema(description = "Identificador único da assinatura", example = "a1b2c3d4-e5f6-7890-1234-56789abcdef0")
        UUID id,
        @Schema(description = "ID do cliente vinculado", example = "b2c3d4e5-f6a7-8901-2345-67890abcdef1")
        UUID clientId,
        @Schema(description = "Nome do cliente", example = "Matheus Henrique")
        String clientName,
        @Schema(description = "E-mail do cliente", example = "cliente@exemplo.com")
        String clientEmail,
        @Schema(description = "ID do plano assinado", example = "c3d4e5f6-a7b8-9012-3456-78901abcdef2")
        UUID planId,
        @Schema(description = "Nome do plano", example = "Plano Premium")
        String planName,
        @Schema(description = "Valor formatado do plano", example = "R$ 49,90")
        String planAmountFormatted,
        @Schema(description = "Rótulo da periodicidade", example = "Mensal")
        String planRecurrenceLabel,
        @Schema(description = "Status técnico da assinatura", example = "ACTIVE")
        Subscription.Status status,
        @Schema(description = "Status legível para o usuário", example = "Ativa")
        String statusLabel,
        @Schema(description = "Data de início da vigência", example = "2026-06-05")
        LocalDate startDate,
        @Schema(description = "Data do próximo vencimento", example = "2026-07-05")
        LocalDate nextDueDate,
        @Schema(description = "Data do cancelamento (se houver)", example = "2026-06-10T15:00:00Z")
        Instant cancelledAt,
        @Schema(description = "Data de criação do registro", example = "2026-06-05T09:00:00Z")
        Instant createdAt,
        @Schema(description = "Data da última atualização", example = "2026-06-05T09:00:00Z")
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