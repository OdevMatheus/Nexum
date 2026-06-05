package com.matheushenrique.nexum.dtos.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(

        @NotBlank
        @Email
        @Schema(description = "E-mail corporativo do usuário", example = "admin@nexum.dev")
        String email,

        @NotBlank
        @Schema(description = "Senha de acesso", example = "SenhaForte@123")
        String password

) {}