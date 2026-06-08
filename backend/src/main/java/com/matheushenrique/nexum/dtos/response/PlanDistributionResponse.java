package com.matheushenrique.nexum.dtos.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.UUID;

public record PlanDistributionResponse(
        @Schema(description = "ID do plano", example = "123e4567-e89b-12d3-a456-426614174000")
        UUID planId,

        @Schema(description = "Nome do plano", example = "Plano Básico")
        String planName,

        @Schema(description = "Quantidade de assinaturas ativas ou em trial", example = "15")
        long count
) {}
