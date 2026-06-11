package com.matheushenrique.nexum.dtos.request;

import com.matheushenrique.nexum.security.validators.ValidPassword;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @NotBlank(message = "Token is required")
        @Schema(description = "Token recebido por e-mail para alteração de senha", example = "550e8400-e29b-41d4-a716-446655440000")
        String token,

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        @ValidPassword
        @Schema(description = "Nova senha segura", example = "NexumSecure2026!")
        String password
) {}
