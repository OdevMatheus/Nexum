package com.matheushenrique.nexum.dtos.response;

import com.matheushenrique.nexum.entities.SubscriptionCycle;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record SubscriptionCycleResponse(
        @Schema(description = "Identificador único do ciclo de cobrança", example = "a1b2c3d4-e5f6-7890-1234-56789abcdef0")
        UUID id,
        @Schema(description = "Data de vencimento desta fatura", example = "2026-06-15")
        LocalDate dueDate,
        @Schema(description = "Data e hora em que o pagamento foi registrado", example = "2026-06-10T14:30:00Z")
        Instant paidAt,
        @Schema(description = "Valor da cobrança em centavos", example = "4990")
        Integer amountCents,
        @Schema(description = "Valor formatado para exibição (R$)", example = "R$ 49,90")
        String amountFormatted,
        @Schema(description = "Status técnico do ciclo (Enum)", example = "PAID")
        SubscriptionCycle.CycleStatus status,
        @Schema(description = "Status formatado para exibição ao usuário", example = "Pago")
        String statusLabel,
        @Schema(description = "Data e hora de criação do registro no sistema", example = "2026-06-01T09:00:00Z")
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