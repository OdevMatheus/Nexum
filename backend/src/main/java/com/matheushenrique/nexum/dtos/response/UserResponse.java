package com.matheushenrique.nexum.dtos.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.UUID;

public record UserResponse(
        @Schema(description = "ID do usuário", example = "123e4567-e89b-12d3-a456-426614174000")
        UUID id,

        @Schema(description = "Nome do usuário", example = "Matheus Henrique")
        String name,

        @Schema(description = "E-mail do usuário", example = "matheus@nexum.com")
        String email
) {}