package com.matheushenrique.nexum.dtos.request;

import com.matheushenrique.nexum.security.validators.ValidPassword;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
        @NotBlank(message = "Current password is required")
        @Schema(description = "Senha atual do usuário", example = "senhaAtual123")
        String currentPassword,

        @NotBlank(message = "New password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        @ValidPassword
        @Schema(description = "Nova senha do usuário", example = "NovaSenha@123")
        String newPassword
) {}