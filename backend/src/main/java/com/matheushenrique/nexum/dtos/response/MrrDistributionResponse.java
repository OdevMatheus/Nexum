package com.matheushenrique.nexum.dtos.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.UUID;

public record MrrDistributionResponse(
        @Schema(description = "ID do plano", example = "123e4567-e89b-12d3-a456-426614174000")
        UUID planId,

        @Schema(description = "Nome do plano", example = "Plano Básico")
        String planName,

        @Schema(description = "Soma do MRR em centavos", example = "150000")
        long amount
) {}
