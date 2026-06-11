package com.matheushenrique.nexum.dtos.request;

import com.matheushenrique.nexum.security.validators.ValidEmail;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(
        @NotBlank(message = "Email is required")
        @ValidEmail(message = "Invalid email address")
        @Schema(description = "E-mail cadastrado do usuário", example = "matheus@nexum.dev")
        String email
) {}
