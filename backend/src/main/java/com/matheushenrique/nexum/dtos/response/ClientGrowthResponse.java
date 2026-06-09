package com.matheushenrique.nexum.dtos.response;

import io.swagger.v3.oas.annotations.media.Schema;

public record ClientGrowthResponse(
        @Schema(description = "Ano", example = "2026")
        int year,

        @Schema(description = "Mês", example = "6")
        int month,

        @Schema(description = "Nome resumido do mês", example = "Jun")
        String label,

        @Schema(description = "Quantidade de clientes acumulados até este mês", example = "42")
        long count
) {}
