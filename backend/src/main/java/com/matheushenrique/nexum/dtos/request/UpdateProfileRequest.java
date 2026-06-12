package com.matheushenrique.nexum.dtos.request;

import com.matheushenrique.nexum.security.validators.ValidEmail;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        @Schema(description = "Nome do usuário", example = "Matheus Henrique")
        String name,

        @NotBlank(message = "Email is required")
        @ValidEmail(message = "Invalid email address")
        @Schema(description = "E-mail do usuário", example = "matheus@nexum.com")
        String email
) {}