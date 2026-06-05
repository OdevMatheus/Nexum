package com.matheushenrique.nexum.dtos.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateClientRequest(

        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        @Schema(description = "Nome completo ou razão social do cliente", example = "Acme Soluções LTDA")
        String name,

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        @Schema(description = "Endereço de e-mail para contato", example = "contato@acme.com.br")
        String email,

        @Schema(description = "Número de telefone para contato", example = "(11) 99999-9999")
        String phone,

        @Schema(description = "Documento de identificação (CPF ou CNPJ)", example = "12.345.678/0001-90")
        String document

) {}