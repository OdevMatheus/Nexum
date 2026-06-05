package com.matheushenrique.nexum.dtos.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record CreateSubscriptionRequest(
        @Schema(description = "Identificador único do cliente que está assinando", example = "a1b2c3d4-e5f6-7890-1234-56789abcdef0")
        @NotNull UUID clientId,
        @Schema(description = "Identificador único do plano selecionado", example = "f0e1d2c3-b4a5-6789-0123-456789abcdef")
        @NotNull UUID planId,
        @Schema(description = "Data de início da vigência da assinatura", example = "2026-06-05")
        @NotNull LocalDate startDate
) {}