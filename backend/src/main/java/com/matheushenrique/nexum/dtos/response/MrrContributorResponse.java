package com.matheushenrique.nexum.dtos.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDate;
import java.util.UUID;

public record MrrContributorResponse(
        @Schema(description = "ID da assinatura", example = "123e4567-e89b-12d3-a456-426614174000")
        UUID subscriptionId,

        @Schema(description = "Nome do cliente", example = "João Silva")
        String clientName,

        @Schema(description = "ID do cliente", example = "123e4567-e89b-12d3-a456-426614174000")
        UUID clientId,

        @Schema(description = "Nome do plano", example = "Plano Básico")
        String planName,

        @Schema(description = "ID do plano", example = "123e4567-e89b-12d3-a456-426614174000")
        UUID planId,

        @Schema(description = "Data de vencimento do ciclo", example = "2026-06-15")
        LocalDate dueDate,

        @Schema(description = "Valor da fatura do ciclo em centavos", example = "9900")
        long amount
) {}
