package com.matheushenrique.nexum.dtos.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

public record AuthResponse(
        @Schema(description = "Identificador único do usuário autenticado", example = "a1b2c3d4-e5f6-7890-1234-56789abcdef0")
        UUID userId,
        @Schema(description = "Nome completo do usuário", example = "Matheus Henrique")
        String name,
        @Schema(description = "E-mail do usuário", example = "matheus@nexum.dev")
        String email,
        @Schema(description = "Token JWT de acesso utilizado para autenticar requisições", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
        String accessToken,
        @Schema(description = "Token utilizado para renovar a sessão de acesso", example = "d87a9f62-b912-4c31-98a2-123456789abc")
        String refreshToken
) {}