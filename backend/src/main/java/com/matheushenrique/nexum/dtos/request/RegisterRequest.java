package com.matheushenrique.nexum.dtos.request;

import com.matheushenrique.nexum.security.validators.ValidEmail;
import com.matheushenrique.nexum.security.validators.ValidPassword;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        @Schema(description = "Nome completo do usuário", example = "Matheus Henrique")
        String name,

        @NotBlank(message = "Email is required")
        @ValidEmail(message = "Invalid email address")
        @Schema(description = "E-mail para acesso e verificação da conta", example = "matheus@nexum.dev")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        @Schema(description = "Senha segura (mínimo de 8 caracteres)", example = "NexumSecure2026!")
        @ValidPassword
        String password

) {}