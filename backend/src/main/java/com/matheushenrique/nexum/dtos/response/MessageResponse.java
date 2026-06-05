package com.matheushenrique.nexum.dtos.response;

import io.swagger.v3.oas.annotations.media.Schema;

public record MessageResponse(
        @Schema(description = "Mensagem informativa sobre o resultado da operação", example = "Assinatura cancelada com sucesso")
        String message
) {}